import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Clock, Globe } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { TimezoneRow, NOW_PIXEL_OFFSET, HOUR_WIDTH } from "@/components/TimezoneRow";
import { CityTimezone, formatTime, getUtcOffsetMinutes } from "@/lib/timezone-data";

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

const Index = () => {
  const [locations, setLocations] = useState<CityTimezone[]>(loadLocations);
  const [now, setNow] = useState(new Date());
  const [hoverX, setHoverX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist locations
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = formatTime(localTz);

  // Snap hover to absolute 15-minute clock increments (0, 15, 30, 45)
  const rawHoverOffsetHours = hoverX != null ? (hoverX - NOW_PIXEL_OFFSET) / HOUR_WIDTH : null;
  const hoverOffsetHours = useMemo(() => {
    if (rawHoverOffsetHours == null) return null;
    const hoverMs = now.getTime() + rawHoverOffsetHours * 60 * 60 * 1000;
    const snappedMs = Math.round(hoverMs / (15 * 60 * 1000)) * (15 * 60 * 1000);
    return (snappedMs - now.getTime()) / (60 * 60 * 1000);
  }, [rawHoverOffsetHours, now]);
  const snappedHoverX = hoverOffsetHours != null
    ? NOW_PIXEL_OFFSET + hoverOffsetHours * HOUR_WIDTH
    : null;

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

  function addLocation(city: CityTimezone) {
    if (locations.length >= 5) return;
    if (locations.some((l) => l.city === city.city && l.timezone === city.timezone)) return;
    setLocations([...locations, city]);
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, i) => i !== index));
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

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
          <div
            ref={containerRef}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Line labels row - above the timelines */}
            <div className="relative h-10 mb-2">
              {/* Now label */}
              <div
                className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                style={{ left: `${NOW_PIXEL_OFFSET}px`, transform: "translateX(-50%)" }}
              >
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-now/20 border border-now/40">
                  <Clock className="h-3 w-3 text-now" />
                  <span className="text-xs font-mono font-semibold text-now">{localTime}</span>
                </div>
                <span className="text-[9px] text-now/70 mt-0.5">current local time</span>
              </div>

              {/* Hover label */}
              {snappedHoverX != null && hoverLocalTime && (
                <div
                  className="absolute top-0 pointer-events-none z-30 flex flex-col items-center"
                  style={{ left: `${snappedHoverX}px`, transform: "translateX(-50%)" }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-hover-line/20 border border-hover-line/40">
                    <span className="text-xs font-mono font-bold text-hover-line">{hoverLocalTime}</span>
                    <span className="text-[9px] text-hover-line/70">your local time</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timezone rows */}
            <div className="space-y-4">
              {sortByTimezone(locations).map((loc, i) => (
                <TimezoneRow
                  key={`${loc.city}-${loc.timezone}`}
                  city={loc}
                  now={now}
                  onRemove={() => removeLocation(i)}
                  hoverOffsetHours={hoverOffsetHours}
                  isFirst={i === 0}
                />
              ))}
            </div>

            {/* Unified "now" line spanning all rows */}
            <div
              className="absolute top-10 bottom-0 w-px bg-now/60 z-10 pointer-events-none"
              style={{ left: `${NOW_PIXEL_OFFSET}px` }}
            />

            {/* Hover cursor line spanning all rows */}
            {snappedHoverX != null && (
              <div
                className="absolute top-10 bottom-0 w-px bg-hover-line/70 z-10 pointer-events-none"
                style={{ left: `${snappedHoverX}px` }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
