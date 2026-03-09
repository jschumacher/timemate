

## Timezone Comparison App

A tool to compare times across up to 5 locations, inspired by the provided design.

### Features

1. **Location Input** — Search bar at the top to add locations (city/timezone). Autocomplete from a built-in timezone list mapped to cities. Max 5 locations, with ability to remove each one.

2. **Local Time Indicator** — Green pill at the top showing your current local time, with a vertical line running through all timelines.

3. **Horizontal Timelines** — Each location gets a row showing:
   - Current time in that timezone (large, bold)
   - Location name with flag emoji and UTC offset
   - A scrollable horizontal bar with date segments spanning ~4 days, with hour tick marks
   - Darker/lighter shading to indicate night/day

4. **Live Updates** — Times update every minute automatically.

5. **Dark Theme** — Dark background matching the reference design, with gray timeline bars and subtle date labels.

### Layout
- Top: "Add location" input with search
- Below: Stack of timezone rows, each with the time on the left, timeline bar in the center, and location label on the right
- Vertical "now" line connecting all rows

### Tech
- Built-in timezone database using `Intl.DateTimeFormat` (no external API needed)
- City-to-timezone mapping as a static dataset
- All client-side, no backend required

