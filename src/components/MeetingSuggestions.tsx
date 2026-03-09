import { useMemo } from "react";
import { CityTimezone, getUtcOffsetMinutes } from "@/lib/timezone-data";
import { Users, Clock } from "lucide-react";

interface MeetingSuggestionsProps {
  locations: CityTimezone[];
}

interface MeetingSlot {
  utcHour: number;
  scores: { city: string; hour: number; quality: "great" | "ok" | "poor" }[];
  totalScore: number;
}

const WORK_START = 9;
const WORK_END = 18;

function getQuality(hour: number): "great" | "ok" | "poor" {
  if (hour >= WORK_START && hour < WORK_END) return "great";
  if ((hour >= 7 && hour < WORK_START) || (hour >= WORK_END && hour < 21)) return "ok";
  return "poor";
}

function getScore(hour: number): number {
  if (hour >= WORK_START && hour < WORK_END) return 3;
  if ((hour >= 7 && hour < WORK_START) || (hour >= WORK_END && hour < 21)) return 1;
  return 0;
}

function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
}

export function MeetingSuggestions({ locations }: MeetingSuggestionsProps) {
  const suggestions = useMemo(() => {
    if (locations.length < 2) return [];

    const slots: MeetingSlot[] = [];

    for (let utcHour = 0; utcHour < 24; utcHour++) {
      const scores = locations.map((loc) => {
        const offsetMin = getUtcOffsetMinutes(loc.timezone);
        const localHour = ((utcHour + offsetMin / 60) % 24 + 24) % 24;
        return {
          city: loc.city,
          hour: Math.round(localHour),
          quality: getQuality(Math.round(localHour)),
        };
      });
      const totalScore = scores.reduce((sum, s) => sum + getScore(s.hour), 0);
      slots.push({ utcHour, scores, totalScore });
    }

    slots.sort((a, b) => b.totalScore - a.totalScore);
    return slots.slice(0, 3);
  }, [locations]);

  if (locations.length < 2) return null;

  const qualityColor = {
    great: "text-primary",
    ok: "text-yellow-400",
    poor: "text-destructive",
  };

  const qualityBg = {
    great: "bg-primary/10",
    ok: "bg-yellow-400/10",
    poor: "bg-destructive/10",
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Best Meeting Times</span>
      </div>
      <div className="space-y-3">
        {suggestions.map((slot, i) => (
          <div key={slot.utcHour} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono w-6">#{i + 1}</span>
              <div className="flex flex-wrap gap-2">
                {slot.scores.map((s) => (
                  <div
                    key={s.city}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${qualityBg[s.quality]}`}
                  >
                    <span className="text-xs text-muted-foreground">{s.city}</span>
                    <span className={`text-xs font-mono font-semibold ${qualityColor[s.quality]}`}>
                      {formatHour(s.hour)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground">Work hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-[10px] text-muted-foreground">Early/Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-[10px] text-muted-foreground">Night</span>
        </div>
      </div>
    </div>
  );
}
