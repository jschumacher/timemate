import { useMemo } from "react";
import { X } from "lucide-react";
import { CityTimezone, formatTime, getUtcOffset, getHourInTimezone, getHourPeriod, HourPeriod } from "@/lib/timezone-data";

interface TimezoneRowProps {
  city: CityTimezone;
  now: Date;
  onRemove: () => void;
  hoverOffsetHours?: number | null;
  pinnedOffsetHours?: number | null;
  scrollOffsetHours?: number;
  compact?: boolean;
}

export const TOTAL_HOURS = 720; // 30 days
export const HOURS_BEFORE_NOW = 168; // 7 days before
export const HOUR_WIDTH = 28;

// Layout constants — desktop
export const LEFT_INFO_WIDTH = 180;
export const COLUMN_GAP = 12;

// Layout constants — mobile (full width timeline, no left column)
export const LEFT_INFO_WIDTH_MOBILE = 0;
export const COLUMN_GAP_MOBILE = 0;

// "Now" marker X position in the overall rows container
export const NOW_PIXEL_OFFSET = 300;
export const NOW_PIXEL_OFFSET_MOBILE = 120;

// Derived positions
export const TIMELINE_START_X = LEFT_INFO_WIDTH + COLUMN_GAP;
export const NOW_IN_TIMELINE_X = NOW_PIXEL_OFFSET - TIMELINE_START_X;

export const TIMELINE_START_X_MOBILE = LEFT_INFO_WIDTH_MOBILE + COLUMN_GAP_MOBILE;
export const NOW_IN_TIMELINE_X_MOBILE = NOW_PIXEL_OFFSET_MOBILE - TIMELINE_START_X_MOBILE;

const PERIOD_CLASS: Record<HourPeriod, string> = {
  work: "bg-timeline-work",
  shoulder: "bg-timeline-shoulder",
  night: "bg-timeline-night",
};

export function getTimelineTranslateX(now: Date, scrollOffsetHours: number = 0, mobile: boolean = false): number {
  const minutesFraction = now.getMinutes() / 60;
  const nowPosition = (HOURS_BEFORE_NOW + minutesFraction) * HOUR_WIDTH;
  const nowInTimeline = mobile ? NOW_IN_TIMELINE_X_MOBILE : NOW_IN_TIMELINE_X;
  return -nowPosition + nowInTimeline + scrollOffsetHours * HOUR_WIDTH;
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

export function TimezoneRow({ city, now, onRemove, hoverOffsetHours, pinnedOffsetHours, scrollOffsetHours = 0, compact = false }: TimezoneRowProps) {
  const time = formatTime(city.timezone);
  const offset = getUtcOffset(city.timezone);

  const segments = useMemo(() => {
    const segs: { hour: number; date: Date; period: HourPeriod; label?: string }[] = [];
    const hourAlignedNow = new Date(now);
    hourAlignedNow.setMinutes(0, 0, 0);
    const startTime = new Date(hourAlignedNow.getTime() - HOURS_BEFORE_NOW * 60 * 60 * 1000);

    for (let i = 0; i < TOTAL_HOURS; i++) {
      const d = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const h = getHourInTimezone(city.timezone, d);
      const dateStr =
        h === 0
          ? new Intl.DateTimeFormat("en-US", {
              timeZone: city.timezone,
              day: "numeric",
              month: "short",
            }).format(d)
          : undefined;
      segs.push({ hour: h, date: d, period: getHourPeriod(h), label: dateStr });
    }
    return segs;
  }, [city.timezone, now]);

  const translateX = getTimelineTranslateX(now, scrollOffsetHours, compact);

  const hoverTimeLabel = useMemo(() => {
    if (hoverOffsetHours == null) return null;
    return formatTimeAtOffset(city.timezone, now, hoverOffsetHours);
  }, [hoverOffsetHours, now, city.timezone]);

  const pinnedTimeLabel = useMemo(() => {
    if (pinnedOffsetHours == null) return null;
    return formatTimeAtOffset(city.timezone, now, pinnedOffsetHours);
  }, [pinnedOffsetHours, now, city.timezone]);

  const displayLabel = hoverTimeLabel ?? pinnedTimeLabel;

  const timelineBar = (
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
            className={`relative h-full flex-shrink-0 border-r border-border/30 ${PERIOD_CLASS[seg.period]}`}
            style={{ width: `${HOUR_WIDTH}px` }}
          >
            {seg.hour % 3 === 0 && (
              <span className="absolute bottom-0.5 left-0.5 text-[9px] text-muted-foreground/60 font-mono leading-none">
                {(seg.hour % 12 || 12).toString()}
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
  );

  if (compact) {
    // Mobile: city info row on top, full-width timeline below
    return (
      <div className="group relative">
        {/* Top row: flag + city + time + remove */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{city.flag}</span>
            <span className="text-[11px] text-muted-foreground truncate">{city.city}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {displayLabel != null ? (
              <span className="font-bold text-sm text-foreground font-mono">{displayLabel}</span>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">{time}</span>
            )}
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-all inline-flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-white hover:bg-destructive shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
        {/* Full-width timeline */}
        {timelineBar}
      </div>
    );
  }

  // Desktop: horizontal layout
  return (
    <div className="group relative">
      <div className="flex items-center gap-3">
        {/* Left info */}
        <div className="flex items-center shrink-0 w-[180px]">
          <span className="text-base shrink-0">{city.flag}</span>
          <div className="flex-1 min-w-0 ml-2">
            <div className="text-xs text-muted-foreground leading-tight truncate">
              {city.city} · {offset}
            </div>
          </div>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-all inline-flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-white hover:bg-destructive shrink-0 ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline */}
        {timelineBar}

        {/* Hover/pinned time or current time */}
        <div className="min-w-[100px] text-right shrink-0">
          {displayLabel != null ? (
            <span className="font-bold text-lg text-foreground font-mono">{displayLabel}</span>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">{time}</span>
          )}
        </div>
      </div>
    </div>
  );
}
