import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Globe, Copy, Link, Check, X } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { TimezoneRow, NOW_PIXEL_OFFSET, HOUR_WIDTH, TIMELINE_START_X } from "@/components/TimezoneRow";
import { CityTimezone, CITY_TIMEZONES, formatTime, getUtcOffsetMinutes } from "@/lib/timezone-data";
import { toast } from "@/hooks/use-toast";

const NOW_LINE_X = TIMELINE_START_X + (NOW_PIXEL_OFFSET - TIMELINE_START_X);

function sortByTimezone(cities: CityTimezone[]): CityTimezone[] {
  return [...cities].sort((a, b) => getUtcOffsetMinutes(a.timezone) - getUtcOffsetMinutes(b.timezone));
}

const STORAGE_KEY = "timezone-app-locations";

function loadLocations(): CityTimezone[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function snapToQuarter(rawOffsetHours: number, now: Date): number {
  const hoverMs = now.getTime() + rawOffsetHours * 60 * 60 * 1000;
  const snappedMs = Math.round(hoverMs / (15 * 60 * 1000)) * (15 * 60 * 1000);
  return (snappedMs - now.getTime()) / (60 * 60 * 1000);
}

/** Parse cities from URL: ?tz=Sydney|Australia/Sydney,Tokyo|Asia/Tokyo */
function parseCitiesFromUrl(param: string | null): CityTimezone[] | null {
  if (!param) return null;
  try {
    const entries = param.split(",").map((e) => {
      const [city, tz] = e.split("|");
      return { city: decodeURIComponent(city), timezone: decodeURIComponent(tz) };
    });
    return entries
      .map(({ city, timezone }) => {
        // Try to find exact match in our database
        const match = CITY_TIMEZONES.find(
          (c) => c.city === city && c.timezone === timezone
        );
        if (match) return match;
        // Fallback: construct a basic entry
        return { city, country: "", timezone, flag: "🌍" } as CityTimezone;
      })
      .filter((c) => c.timezone);
  } catch {
    return null;
  }
}

function buildShareUrl(locations: CityTimezone[], pinnedOffsetHours: number): string {
  const base = window.location.origin + window.location.pathname;
  const tz = locations
    .map((l) => `${encodeURIComponent(l.city)}|${encodeURIComponent(l.timezone)}`)
    .join(",");
  const pin = pinnedOffsetHours.toFixed(4);
  return `${base}?tz=${tz}&pin=${pin}`;
}

function formatTimeAtOffset(timezone: string, now: Date, offsetHours: number): string {
  const d = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function formatDateAtOffset(timezone: string, now: Date, offsetHours: number): string {
  const d = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCities = useMemo(() => parseCitiesFromUrl(searchParams.get("tz")), []);
  const urlPin = useMemo(() => {
    const p = searchParams.get("pin");
    return p != null ? parseFloat(p) : null;
  }, []);

  // If loaded from a share URL, use URL cities but don't persist
  const isSharedView = urlCities != null && urlCities.length > 0;

  const [locations, setLocations] = useState<CityTimezone[]>(() => {
    if (isSharedView) return urlCities!;
    return loadLocations();
  });
  const [now, setNow] = useState(new Date());
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [pinnedOffsetHours, setPinnedOffsetHours] = useState<number | null>(urlPin);
  const [copiedTime, setCopiedTime] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Only persist to localStorage if NOT a shared view
  useEffect(() => {
    if (!isSharedView) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    }
  }, [locations, isSharedView]);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = formatTime(localTz);

  // Snap hover
  const rawHoverOffsetHours = hoverX != null ? (hoverX - NOW_LINE_X) / HOUR_WIDTH : null;
  const hoverOffsetHours = useMemo(() => {
    if (rawHoverOffsetHours == null) return null;
    return snapToQuarter(rawHoverOffsetHours, now);
  }, [rawHoverOffsetHours, now]);
  const snappedHoverX = hoverOffsetHours != null ? NOW_LINE_X + hoverOffsetHours * HOUR_WIDTH : null;

  const pinnedX = pinnedOffsetHours != null ? NOW_LINE_X + pinnedOffsetHours * HOUR_WIDTH : null;

  const hoverLocalTime = useMemo(() => {
    if (hoverOffsetHours == null) return null;
    const hoverDate = new Date(now.getTime() + hoverOffsetHours * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: localTz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(hoverDate);
  }, [hoverOffsetHours, now, localTz]);

  const pinnedLocalTime = useMemo(() => {
    if (pinnedOffsetHours == null) return null;
    const d = new Date(now.getTime() + pinnedOffsetHours * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: localTz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  }, [pinnedOffsetHours, now, localTz]);

  const sortedLocations = useMemo(() => sortByTimezone(locations), [locations]);

  // Pinned summary data
  const pinnedSummary = useMemo(() => {
    if (pinnedOffsetHours == null || locations.length === 0) return null;
    return sortedLocations.map((loc) => ({
      city: loc.city,
      flag: loc.flag,
      time: formatTimeAtOffset(loc.timezone, now, pinnedOffsetHours),
      date: formatDateAtOffset(loc.timezone, now, pinnedOffsetHours),
      timezone: loc.timezone,
    }));
  }, [pinnedOffsetHours, now, sortedLocations, locations]);

  function addLocation(city: CityTimezone) {
    if (locations.length >= 5) return;
    if (locations.some((l) => l.city === city.city && l.timezone === city.timezone)) return;
    setLocations([...locations, city]);
  }

  function removeLocation(city: CityTimezone) {
    setLocations(locations.filter((l) => !(l.city === city.city && l.timezone === city.timezone)));
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Only show hover when over the timeline area (not city name or time columns)
    if (x >= TIMELINE_START_X && x <= rect.width - 112) {
      setHoverX(x);
    } else {
      setHoverX(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  const handleClick = useCallback(() => {
    if (hoverOffsetHours == null) return;
    if (pinnedOffsetHours != null && Math.abs(pinnedOffsetHours - hoverOffsetHours) < 0.01) {
      setPinnedOffsetHours(null);
    } else {
      setPinnedOffsetHours(hoverOffsetHours);
    }
  }, [hoverOffsetHours, pinnedOffsetHours]);

  const handleCopyTimes = useCallback(() => {
    if (!pinnedSummary) return;
    const lines = pinnedSummary.map((s) => `${s.flag} ${s.city}: ${s.time}, ${s.date}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedTime(true);
    setTimeout(() => setCopiedTime(false), 2000);
  }, [pinnedSummary]);

  const handleCopyLink = useCallback(() => {
    if (pinnedOffsetHours == null) return;
    const url = buildShareUrl(locations, pinnedOffsetHours);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [locations, pinnedOffsetHours]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Timezone</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Compare times across locations
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <LocationSearch onAdd={addLocation} disabled={locations.length >= 5} />
        </div>

        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              Search for a city to get started
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Add up to 5 locations to compare timezones
            </p>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="relative cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            >
              {/* Line labels row */}
              <div className="relative h-10 mb-2">
                {/* Now label */}
                <div
                  className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                  style={{ left: `${NOW_LINE_X}px`, transform: "translateX(-50%)" }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-now/20 border border-now/40">
                    <Clock className="h-3 w-3 text-now" />
                    <span className="text-xs font-mono font-semibold text-now">{localTime}</span>
                  </div>
                  <span className="text-[9px] text-now/70 mt-0.5">current local time</span>
                </div>

                {/* Pinned label (always visible when set) */}
                {pinnedX != null && pinnedLocalTime && hoverX == null && (
                  <div
                    className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                    style={{ left: `${pinnedX}px`, transform: "translateX(-50%)" }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-hover-line/20 border border-hover-line/40">
                      <span className="text-xs font-mono font-bold text-hover-line">{pinnedLocalTime}</span>
                      <span className="text-[9px] text-hover-line/70">pinned</span>
                    </div>
                  </div>
                )}

                {/* Hover label */}
                {snappedHoverX != null && hoverLocalTime && (
                  <div
                    className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                    style={{ left: `${snappedHoverX}px`, transform: "translateX(-50%)" }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-hover-line/20 border border-hover-line/40">
                      <span className="text-xs font-mono font-bold text-hover-line">{hoverLocalTime}</span>
                      <span className="text-[9px] text-hover-line/70">click to pin</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timezone rows */}
              <div className="space-y-4">
                {sortedLocations.map((loc) => (
                  <TimezoneRow
                    key={`${loc.city}-${loc.timezone}`}
                    city={loc}
                    now={now}
                    onRemove={() => removeLocation(loc)}
                    hoverOffsetHours={hoverOffsetHours}
                    pinnedOffsetHours={pinnedOffsetHours}
                  />
                ))}
              </div>

              {/* Unified "now" line */}
              <div
                className="absolute top-10 bottom-0 w-px bg-now/60 z-10 pointer-events-none"
                style={{ left: `${NOW_LINE_X}px` }}
              />

              {/* Pinned line (always visible) */}
              {pinnedX != null && (
                <div
                  className="absolute top-10 bottom-0 w-0.5 bg-hover-line/50 z-10 pointer-events-none"
                  style={{ left: `${pinnedX}px` }}
                />
              )}

              {/* Hover cursor line */}
              {snappedHoverX != null && (
                <div
                  className="absolute top-10 bottom-0 w-px bg-hover-line/70 z-10 pointer-events-none"
                  style={{ left: `${snappedHoverX}px` }}
                />
              )}
            </div>

            {/* Pinned summary – compact inline */}
            {pinnedSummary && (
              <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Pinned
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyTimes}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {copiedTime ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedTime ? "Copied" : "Times"}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {copiedLink ? <Check className="h-3 w-3" /> : <Link className="h-3 w-3" />}
                      {copiedLink ? "Copied" : "Link"}
                    </button>
                    <button
                      onClick={() => setPinnedOffsetHours(null)}
                      className="inline-flex items-center p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                      title="Unpin"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {pinnedSummary.map((s) => (
                    <div key={`${s.city}-${s.timezone}`} className="flex items-center gap-2 text-sm py-0.5">
                      <span className="shrink-0">{s.flag}</span>
                      <span className="font-medium text-foreground w-24 truncate">{s.city}</span>
                      <span className="font-mono font-bold text-foreground w-20 text-right">{s.time}</span>
                      <span className="text-muted-foreground text-xs">{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
