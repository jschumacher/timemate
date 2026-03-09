export interface CityTimezone {
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

export const CITY_TIMEZONES: CityTimezone[] = [
  { city: "New York", country: "US", timezone: "America/New_York", flag: "🇺🇸" },
  { city: "Los Angeles", country: "US", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Chicago", country: "US", timezone: "America/Chicago", flag: "🇺🇸" },
  { city: "Denver", country: "US", timezone: "America/Denver", flag: "🇺🇸" },
  { city: "San Francisco", country: "US", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Miami", country: "US", timezone: "America/New_York", flag: "🇺🇸" },
  { city: "Seattle", country: "US", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Houston", country: "US", timezone: "America/Chicago", flag: "🇺🇸" },
  { city: "Phoenix", country: "US", timezone: "America/Phoenix", flag: "🇺🇸" },
  { city: "Honolulu", country: "US", timezone: "Pacific/Honolulu", flag: "🇺🇸" },
  { city: "Anchorage", country: "US", timezone: "America/Anchorage", flag: "🇺🇸" },
  { city: "London", country: "UK", timezone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris", country: "France", timezone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  { city: "Madrid", country: "Spain", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { city: "Rome", country: "Italy", timezone: "Europe/Rome", flag: "🇮🇹" },
  { city: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", flag: "🇨🇭" },
  { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", flag: "🇸🇪" },
  { city: "Oslo", country: "Norway", timezone: "Europe/Oslo", flag: "🇳🇴" },
  { city: "Helsinki", country: "Finland", timezone: "Europe/Helsinki", flag: "🇫🇮" },
  { city: "Athens", country: "Greece", timezone: "Europe/Athens", flag: "🇬🇷" },
  { city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", flag: "🇹🇷" },
  { city: "Moscow", country: "Russia", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { city: "Dubai", country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Mumbai", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Delhi", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Bangalore", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Kolkata", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { city: "Shanghai", country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { city: "Beijing", country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Osaka", country: "Japan", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Sydney", country: "Australia", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { city: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", flag: "🇦🇺" },
  { city: "Perth", country: "Australia", timezone: "Australia/Perth", flag: "🇦🇺" },
  { city: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  { city: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", flag: "🇲🇽" },
  { city: "Bogotá", country: "Colombia", timezone: "America/Bogota", flag: "🇨🇴" },
  { city: "Lima", country: "Peru", timezone: "America/Lima", flag: "🇵🇪" },
  { city: "Santiago", country: "Chile", timezone: "America/Santiago", flag: "🇨🇱" },
  { city: "Cairo", country: "Egypt", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { city: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { city: "Cape Town", country: "South Africa", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { city: "Toronto", country: "Canada", timezone: "America/Toronto", flag: "🇨🇦" },
  { city: "Vancouver", country: "Canada", timezone: "America/Vancouver", flag: "🇨🇦" },
  { city: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", flag: "🇹🇼" },
  { city: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  { city: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", flag: "🇵🇰" },
  { city: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { city: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", flag: "🇵🇹" },
  { city: "Warsaw", country: "Poland", timezone: "Europe/Warsaw", flag: "🇵🇱" },
  { city: "Prague", country: "Czech Republic", timezone: "Europe/Prague", flag: "🇨🇿" },
  { city: "Vienna", country: "Austria", timezone: "Europe/Vienna", flag: "🇦🇹" },
  { city: "Dublin", country: "Ireland", timezone: "Europe/Dublin", flag: "🇮🇪" },
  { city: "Reykjavik", country: "Iceland", timezone: "Atlantic/Reykjavik", flag: "🇮🇸" },
  { city: "Doha", country: "Qatar", timezone: "Asia/Qatar", flag: "🇶🇦" },
  { city: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh", flag: "🇸🇦" },
  { city: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { city: "Manila", country: "Philippines", timezone: "Asia/Manila", flag: "🇵🇭" },
  { city: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { city: "Colombo", country: "Sri Lanka", timezone: "Asia/Colombo", flag: "🇱🇰" },
  { city: "Casablanca", country: "Morocco", timezone: "Africa/Casablanca", flag: "🇲🇦" },
];

export function getUtcOffset(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart?.value?.replace("GMT", "UTC") ?? "UTC";
}

export function getTimeInTimezone(timezone: string): Date {
  const now = new Date();
  const str = now.toLocaleString("en-US", { timeZone: timezone });
  return new Date(str);
}

export function formatTime(timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function formatDate(timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function getHourInTimezone(timezone: string, date: Date): number {
  const str = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).format(date);
  return parseInt(str, 10);
}

export function isNightHour(hour: number): boolean {
  return hour < 7 || hour >= 21;
}

export function searchCities(query: string): CityTimezone[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return CITY_TIMEZONES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.timezone.toLowerCase().includes(q)
  ).slice(0, 8);
}
