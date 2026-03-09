import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Globe, Copy, Link, Check, X, Plus, RotateCcw } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { TimezoneRow, NOW_PIXEL_OFFSET, HOUR_WIDTH, TIMELINE_START_X } from "@/components/TimezoneRow";
import { RollingText } from "@/components/RollingText";
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

function parseCitiesFromUrl(param: string | null): CityTimezone[] | null {
  if (!param) return null;
  try {
    const entries = param.split(",").map((e) => {
      const [city, tz] = e.split("|");
      return { city: decodeURIComponent(city), timezone: decodeURIComponent(tz) };
    });
    return entries
      .map(({ city, timezone }) => {
        const match = CITY_TIMEZONES.find((c) => c.city === city && c.timezone === timezone);
        if (match) return match;
        return { city, country: "", timezone, flag: "🌍" } as CityTimezone;
      })
      .filter((c) => c.timezone);
  } catch {
    return null;
  }
}

function buildShareUrl(locations: CityTimezone[], pinnedOffsets: number[]): string {
  const base = window.location.origin + window.location.pathname;
  const tz = locations
    .map((l) => `${encodeURIComponent(l.city)}|${encodeURIComponent(l.timezone)}`)
    .join(",");
  const pins = pinnedOffsets.map((p) => p.toFixed(4)).join(",");
  return `${base}?tz=${tz}&pin=${pins}`;
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
  const urlPins = useMemo(() => {
    const p = searchParams.get("pin");
    if (p == null) return [];
    return p.split(",").map(Number).filter((n) => !isNaN(n));
  }, []);

  const isSharedView = urlCities != null && urlCities.length > 0;

  const [locations, setLocations] = useState<CityTimezone[]>(() => {
    if (isSharedView) return urlCities!;
    return loadLocations();
  });
  const [now, setNow] = useState(new Date());
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [pinnedOffsets, setPinnedOffsets] = useState<number[]>(urlPins);
  const [copiedTime, setCopiedTime] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollOffsetHours, setScrollOffsetHours] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; scrollAtStart: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep backward compat: expose first pinned offset for timeline row display
  const pinnedOffsetHours = pinnedOffsets.length > 0 ? pinnedOffsets[pinnedOffsets.length - 1] : null;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSharedView) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    }
  }, [locations, isSharedView]);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = formatTime(localTz);

  // Hover offset accounts for scroll: the pixel position maps to a different time when scrolled
  const scrolledNowLineX = NOW_LINE_X + scrollOffsetHours * HOUR_WIDTH;
  const rawHoverOffsetHours = hoverX != null ? (hoverX - scrolledNowLineX) / HOUR_WIDTH : null;
  const hoverOffsetHours = useMemo(() => {
    if (rawHoverOffsetHours == null) return null;
    return snapToQuarter(rawHoverOffsetHours, now);
  }, [rawHoverOffsetHours, now]);
  const snappedHoverX = hoverOffsetHours != null ? scrolledNowLineX + hoverOffsetHours * HOUR_WIDTH : null;

  const pinnedXPositions = pinnedOffsets.map((o) => scrolledNowLineX + o * HOUR_WIDTH);

  // Split date into parts for animated display
  const viewingDate = useMemo(() => {
    const localTzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const d = new Date(now.getTime() - scrollOffsetHours * 60 * 60 * 1000);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: localTzName, weekday: "long" }).format(d);
    const month = new Intl.DateTimeFormat("en-US", { timeZone: localTzName, month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en-US", { timeZone: localTzName, day: "numeric" }).format(d);
    const year = new Intl.DateTimeFormat("en-US", { timeZone: localTzName, year: "numeric" }).format(d);
    return { weekday, month, day, year, key: `${weekday}-${month}-${day}` };
  }, [now, scrollOffsetHours]);

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

  // Build summary for each pinned option
  const pinnedOptions = useMemo(() => {
    if (pinnedOffsets.length === 0 || locations.length === 0) return null;
    return pinnedOffsets.map((offset) => ({
      offset,
      cities: sortedLocations.map((loc) => ({
        city: loc.city,
        flag: loc.flag,
        time: formatTimeAtOffset(loc.timezone, now, offset),
        date: formatDateAtOffset(loc.timezone, now, offset),
        timezone: loc.timezone,
      })),
    }));
  }, [pinnedOffsets, now, sortedLocations, locations]);

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

    // Handle drag
    if (isDragging && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const hoursShift = dx / HOUR_WIDTH;
      setScrollOffsetHours(
        Math.max(-168, Math.min(168, dragStartRef.current.scrollAtStart + hoursShift))
      );
      setHoverX(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= TIMELINE_START_X && x <= rect.width - 112) {
      setHoverX(x);
    } else {
      setHoverX(null);
    }
  }, [isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= TIMELINE_START_X && x <= rect.width - 112) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, scrollAtStart: scrollOffsetHours };
      setHoverX(null);
      e.preventDefault();
    }
  }, [scrollOffsetHours]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  }, [isDragging]);

  // Global mouse up listener to catch releases outside the container
  useEffect(() => {
    if (isDragging) {
      const handleGlobalUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
      };
      window.addEventListener("mouseup", handleGlobalUp);
      return () => window.removeEventListener("mouseup", handleGlobalUp);
    }
  }, [isDragging]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const hoursPerScroll = delta / 30;
    setScrollOffsetHours((prev) => Math.max(-168, Math.min(168, prev - hoursPerScroll)));
    e.preventDefault();
  }, []);

  const resetScroll = useCallback(() => {
    setScrollOffsetHours(0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  const handleClick = useCallback(() => {
    if (isDragging) return; // Don't pin if we were dragging
    if (hoverOffsetHours == null) return;
    const existingIdx = pinnedOffsets.findIndex((o) => Math.abs(o - hoverOffsetHours) < 0.01);
    if (existingIdx !== -1) {
      setPinnedOffsets(pinnedOffsets.filter((_, i) => i !== existingIdx));
    } else {
      if (pinnedOffsets.length >= 5) return;
      setPinnedOffsets([...pinnedOffsets, hoverOffsetHours]);
    }
  }, [hoverOffsetHours, pinnedOffsets, isDragging]);

  const removeOption = useCallback((index: number) => {
    setPinnedOffsets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCopyTimes = useCallback(() => {
    if (!pinnedOptions) return;
    const lines = pinnedOptions.map((opt, i) => {
      const header = `Option ${i + 1}`;
      const cities = opt.cities.map((s) => `  ${s.flag} ${s.city}: ${s.time}, ${s.date}`);
      return [header, ...cities].join("\n");
    });
    navigator.clipboard.writeText(lines.join("\n\n"));
    setCopiedTime(true);
    setTimeout(() => setCopiedTime(false), 2000);
  }, [pinnedOptions]);

  const handleCopyLink = useCallback(() => {
    if (pinnedOffsets.length === 0) return;
    const url = buildShareUrl(locations, pinnedOffsets);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [locations, pinnedOffsets]);

  const pinnedX = pinnedOffsetHours != null ? scrolledNowLineX + pinnedOffsetHours * HOUR_WIDTH : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        {/* Header row: logo + search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Timemate logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tight">Timemate</h1>
          </div>
          <div className="w-72">
            <LocationSearch onAdd={addLocation} disabled={locations.length >= 5} />
          </div>
        </div>

        {/* Animated date display */}
        <div className="mb-6 flex items-baseline gap-3">
          <RollingText text={viewingDate.day} className="text-4xl font-bold tracking-tight text-foreground" />
          <RollingText text={viewingDate.month} className="text-2xl font-semibold text-foreground/80" />
          <RollingText text={viewingDate.year} className="text-lg text-muted-foreground" />
          <span className="text-sm text-muted-foreground ml-1">{viewingDate.weekday}</span>
          {Math.abs(scrollOffsetHours) > 1 && (
            <button
              onClick={resetScroll}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors ml-2"
            >
              <RotateCcw className="h-3 w-3" />
              Today
            </button>
          )}
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
            <p className="text-[10px] text-muted-foreground/50 mb-2">Scroll to navigate dates</p>

            <div
              ref={containerRef}
              className="relative cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              onWheel={handleWheel}
            >
              {/* Line labels row */}
              <div className="relative h-10 mb-2">
                {/* Now label - moves with scroll */}
                <div
                  className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                  style={{ left: `${scrolledNowLineX}px`, transform: "translateX(-50%)" }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-now/20 border border-now/40">
                    <Clock className="h-3 w-3 text-now" />
                    <span className="text-xs font-mono font-semibold text-now">{localTime}</span>
                  </div>
                  <span className="text-[9px] text-now/70 mt-0.5">now</span>
                </div>

                {/* Pinned label (show last pinned when not hovering) */}
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
                    scrollOffsetHours={scrollOffsetHours}
                  />
                ))}
              </div>

              {/* Unified "now" line - moves with scroll */}
              <div
                className="absolute top-10 bottom-0 w-px bg-now/60 z-10 pointer-events-none"
                style={{ left: `${scrolledNowLineX}px` }}
              />

              {/* Pinned lines (all of them) */}
              {pinnedXPositions.map((px, i) => (
                <div
                  key={i}
                  className="absolute top-10 bottom-0 w-0.5 bg-hover-line/50 z-10 pointer-events-none"
                  style={{ left: `${px}px` }}
                />
              ))}

              {/* Hover cursor line */}
              {snappedHoverX != null && (
                <div
                  className="absolute top-10 bottom-0 w-px bg-hover-line/70 z-10 pointer-events-none"
                  style={{ left: `${snappedHoverX}px` }}
                />
              )}
            </div>

            {/* Pinned options panel */}
            {pinnedOptions && pinnedOptions.length > 0 && (
              <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Pinned times · {pinnedOptions.length} option{pinnedOptions.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyTimes}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {copiedTime ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedTime ? "Copied" : "Copy all"}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {copiedLink ? <Check className="h-3 w-3" /> : <Link className="h-3 w-3" />}
                      {copiedLink ? "Copied" : "Share link"}
                    </button>
                    <button
                      onClick={() => setPinnedOffsets([])}
                      className="inline-flex items-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                      title="Clear all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-0 divide-x divide-border/50">
                  {pinnedOptions.map((opt, optIdx) => (
                    <div key={optIdx} className="px-5 py-3 min-w-[280px]">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-semibold text-primary">
                            Option {optIdx + 1}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {opt.cities[0]?.date}
                          </span>
                        </div>
                        <button
                          onClick={() => removeOption(optIdx)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-white hover:bg-destructive transition-colors"
                          title="Remove option"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {opt.cities.map((s) => (
                          <div
                            key={`${s.city}-${s.timezone}`}
                            className="flex items-center gap-3 text-sm py-0.5"
                          >
                            <span className="shrink-0">{s.flag}</span>
                            <span className="font-medium text-foreground w-32 truncate">{s.city}</span>
                            <span className="font-mono font-bold text-foreground tabular-nums">{s.time}</span>
                          </div>
                        ))}
                      </div>
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
