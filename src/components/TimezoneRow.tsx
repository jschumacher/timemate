import { useMemo } from "react";
import { X } from "lucide-react";
import { CityTimezone, formatTime, formatDate, getUtcOffset, getHourInTimezone, isNightHour } from "@/lib/timezone-data";

interface TimezoneRowProps {
  city: CityTimezone;
  now: Date;
  onRemove: () => void;
  hoverOffsetHours?: number | null;
  isFirst?: boolean;
}

export const TOTAL_HOURS = 96;
export const HOURS_BEFORE_NOW = 24;
export const HOUR_WIDTH = 28;
export const NOW_PIXEL_OFFSET = 300;

export function getTimelineTranslateX(now: Date): number {
  const minutesFraction = now.getMinutes() / 60;
  const nowPosition = (HOURS_BEFORE_NOW + minutesFraction) * HOUR_WIDTH;
  return -nowPosition + NOW_PIXEL_OFFSET;
}

export function TimezoneRow({ city, now, onRemove, hoverOffsetHours, isFirst }: TimezoneRowProps) {
  const time = formatTime(city.timezone);
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
              day: "numeric",
              month: "long",
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
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(hoverDate);
  }, [hoverOffsetHours, now, city.timezone]);

  // Compute hover local time (user's timezone) for the first row header
  const hoverLocalTime = useMemo(() => {
    if (hoverOffsetHours == null) return null;
    const hoverDate = new Date(now.getTime() + hoverOffsetHours * 60 * 60 * 1000);
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: localTz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(hoverDate);
  }, [hoverOffsetHours, now]);

  const hoverPixelX = hoverOffsetHours != null ? NOW_PIXEL_OFFSET + hoverOffsetHours * HOUR_WIDTH : null;

  return (
    <div className="group relative">
      {/* Row: info left, timeline, hover time right */}
      <div className="flex items-center gap-3">
        {/* Left info */}
        <div className="flex items-center gap-2 min-w-[140px] shrink-0">
          <span className="text-base">{city.flag}</span>
          <div>
            <div className="text-xs text-muted-foreground leading-tight">
              {city.city} · {offset}
            </div>
          </div>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent ml-1"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* Timeline */}
        <div className="relative overflow-hidden rounded-md h-10 bg-timeline-bar flex-1">
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
                  <span className="absolute top-1 left-0.5 text-[8px] text-muted-foreground/80 font-medium whitespace-nowrap leading-none">
                    {seg.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hover time - large bold, positioned to the right */}
        <div className="min-w-[100px] text-right shrink-0">
          {hoverTimeLabel != null ? (
            <span className="font-bold text-lg text-foreground font-mono">{hoverTimeLabel}</span>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">{time}</span>
          )}
        </div>
      </div>
    </div>
  );
}
