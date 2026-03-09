import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { TimezoneRow } from "@/components/TimezoneRow";
import { CityTimezone, formatTime } from "@/lib/timezone-data";

const Index = () => {
  const [locations, setLocations] = useState<CityTimezone[]>([]);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const localTime = formatTime(Intl.DateTimeFormat().resolvedOptions().timeZone);

  function addLocation(city: CityTimezone) {
    if (locations.length >= 5) return;
    // Prevent duplicate city+timezone
    if (locations.some((l) => l.city === city.city && l.timezone === city.timezone)) return;
    setLocations([...locations, city]);
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Timezone</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Compare times across locations
        </p>

        {/* Local time pill + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-mono font-semibold text-primary">{localTime}</span>
            <span className="text-xs text-primary/70">local</span>
          </div>
          <LocationSearch onAdd={addLocation} disabled={locations.length >= 5} />
        </div>

        {/* Timezone rows */}
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
          <div className="space-y-6">
            {locations.map((loc, i) => (
              <TimezoneRow
                key={`${loc.city}-${loc.timezone}`}
                city={loc}
                now={now}
                onRemove={() => removeLocation(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
