import { useMemo } from "react";
import { X } from "lucide-react";
import { CityTimezone, formatTime, formatDate, getUtcOffset, getHourInTimezone, isNightHour } from "@/lib/timezone-data";

interface TimezoneRowProps {
  city: CityTimezone;
  now: Date;
  onRemove: () => void;
  hoverOffsetHours?: number | null;
}

export const TOTAL_HOURS = 96;
export const HOURS_BEFORE_NOW = 24;
export const HOUR_WIDTH = 28;
export const NOW_PIXEL_OFFSET = 300; // px from left edge where "now" sits

export function getTimelineTranslateX(now: Date): number {
  const minutesFraction = now.getMinutes() / 60;
  const nowPosition = (HOURS_BEFORE_NOW + minutesFraction) * HOUR_WIDTH;
  return -nowPosition + NOW_PIXEL_OFFSET;
}

export function TimezoneRow({ city, now, onRemove, hoverOffsetHours }: TimezoneRowProps) {
  const time = formatTime(city.timezone);
  const date = formatDate(city.timezone);
  const offset = getUtcOffset(city.timezone);
  const currentHour = getHourInTimezone(city.timezone, now);
  const isNight = isNightHour(currentHour);

  const segments = useMemo(() => {
    const segs: { hour: number; date: Date; isNight: boolean; label?: string }[] = [];
    const startTime = new Date(now.getTime() - HOURS_BEFORE_NOW * 60 * 60 * 1000);

    for (let i = 0; i < TOTAL_HOURS; i++) {
      const d = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const h = getHourInTimezone(city.timezone, d);
      const dateStr =
        h === 0
          ? new Intl.DateTimeFormat("en-US", {
              timeZone: city.timezone,
              weekday: "short",
              month: "short",
              day: "numeric",
            }).format(d)
          : undefined;
      segs.push({ hour: h, date: d, isNight: isNightHour(h), label: dateStr });
    }
    return segs;
  }, [city.timezone, now]);

  const translateX = getTimelineTranslateX(now);

  // Compute hover time label
  const hoverTimeLabel = useMemo(() => {
    if (hoverOffsetHours == null) return null;
    const hoverDate = new Date(now.getTime() + hoverOffsetHours * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(hoverDate);
  }, [hoverOffsetHours, now, city.timezone]);

  return (
    <div className="group relative">
      {/* Info bar */}
      <div className="flex items-center gap-4 mb-2 px-1">
        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="text-lg">{city.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-foreground">{time}</span>
              <span className={`w-2 h-2 rounded-full ${isNight ? "bg-muted-foreground" : "bg-primary"}`} />
            </div>
            <div className="text-xs text-muted-foreground">
              {city.city}, {city.country} · {offset}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">{date}</div>
        <button
          onClick={onRemove}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative overflow-hidden rounded-md h-10 bg-timeline-bar timeline-bar">
        <div
          className="absolute top-0 h-full flex"
          style={{
            width: `${TOTAL_HOURS * HOUR_WIDTH}px`,
            transform: `translateX(${translateX}px)`,
          }}
        >
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`relative h-full flex-shrink-0 border-r border-border/30 ${
                seg.isNight ? "bg-timeline-night" : "bg-timeline-day"
              }`}
              style={{ width: `${HOUR_WIDTH}px` }}
            >
              {seg.hour % 3 === 0 && (
                <span className="absolute bottom-0.5 left-0.5 text-[9px] text-muted-foreground/60 font-mono leading-none">
                  {seg.hour.toString().padStart(2, "0")}
                </span>
              )}
              {seg.label && (
                <span className="absolute -top-0.5 left-0.5 text-[8px] text-muted-foreground/80 font-medium whitespace-nowrap leading-none">
                  {seg.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Hover time label inside the bar */}
        {hoverTimeLabel != null && hoverOffsetHours != null && (
          <div
            className="absolute top-0 h-full flex items-center pointer-events-none z-20"
            style={{ left: `${NOW_PIXEL_OFFSET + hoverOffsetHours * HOUR_WIDTH}px` }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-accent-foreground bg-accent px-1.5 py-0.5 rounded whitespace-nowrap">
              {hoverTimeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
