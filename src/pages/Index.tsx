import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Globe } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { TimezoneRow, NOW_PIXEL_OFFSET, HOUR_WIDTH } from "@/components/TimezoneRow";
import { CityTimezone, formatTime } from "@/lib/timezone-data";

const Index = () => {
  const [locations, setLocations] = useState<CityTimezone[]>([]);
  const [now, setNow] = useState(new Date());
  const [hoverX, setHoverX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const localTime = formatTime(Intl.DateTimeFormat().resolvedOptions().timeZone);

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

  // Convert hover pixel X to hours offset from "now"
  const hoverOffsetHours = hoverX != null ? (hoverX - NOW_PIXEL_OFFSET) / HOUR_WIDTH : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Timezone</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Compare times across locations
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-mono font-semibold text-primary">{localTime}</span>
            <span className="text-xs text-primary/70">local</span>
          </div>
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
            className="relative space-y-6"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {locations.map((loc, i) => (
              <TimezoneRow
                key={`${loc.city}-${loc.timezone}`}
                city={loc}
                now={now}
                onRemove={() => removeLocation(i)}
                hoverOffsetHours={hoverOffsetHours}
              />
            ))}

            {/* Unified "now" line spanning all rows */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-now z-30 pointer-events-none"
              style={{ left: `${NOW_PIXEL_OFFSET}px` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-now" />
            </div>

            {/* Hover cursor line spanning all rows */}
            {hoverX != null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-muted-foreground/50 z-20 pointer-events-none"
                style={{ left: `${hoverX}px` }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
