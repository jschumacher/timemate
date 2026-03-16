

## Plan: Rename to "Timecheck" + Make Mobile-Friendly

### 1. Rename "Welltimed" → "Timecheck"

**Files to update:**
- `src/pages/Index.tsx` — logo alt text and `<h1>` (line 311-312)
- `index.html` — `<title>`, meta description, og:title, twitter:title, og:description, twitter:description (lines 8-23)

### 2. Mobile Responsiveness

The current layout has several issues on small screens:

**Header (line 309-316):** The logo + title and search box are side-by-side with a fixed `w-72` search. On mobile, stack them vertically or make search full-width.

**Date display (line 320-334):** Should scale down text sizes on mobile.

**Timeline rows (TimezoneRow.tsx):**
- Left info column is fixed at `w-[180px]` — needs to shrink on mobile (e.g. `w-[120px]` or `w-[100px]`)
- Right time display is `min-w-[100px]` — reduce on mobile
- The overall layout with `gap-3` works but needs tighter spacing on mobile

**Pinned options panel (lines 440-511):**
- `min-w-[280px]` cards in a flex-wrap — works on mobile but the header actions may overflow
- Copy/share buttons should wrap on small screens

**Specific changes:**

| Area | Current | Mobile Change |
|------|---------|---------------|
| Header | `flex justify-between` with `w-72` search | Stack on mobile: `flex-col sm:flex-row`, search `w-full sm:w-72` |
| Date text | `text-4xl` day | `text-2xl sm:text-4xl` |
| Container padding | `px-4 pt-10` | `px-3 sm:px-4 pt-6 sm:pt-10` |
| TimezoneRow left info | `w-[180px]` | `w-[100px] sm:w-[180px]` |
| TimezoneRow right time | `min-w-[100px]` | `min-w-[60px] sm:min-w-[100px]`, smaller font |
| Pinned panel buttons | horizontal row | `flex-wrap` for small screens |
| Empty state | `py-20` | `py-12 sm:py-20` |

**TimezoneRow constants:** `LEFT_INFO_WIDTH` (180px) and `COLUMN_GAP` (12px) are used for pixel calculations (marker line positions). These need to adapt too — either via a prop from the parent that detects mobile, or by using CSS-only approaches where possible. The timeline marker positions (`NOW_PIXEL_OFFSET`, `TIMELINE_START_X`) depend on these constants, so we'll pass a `compact` prop to TimezoneRow and adjust the exported constants to support both modes. The parent will use the `useIsMobile` hook.

**Key constraint:** The timeline pixel math (hover lines, now line, pinned lines) all depend on `TIMELINE_START_X` and `NOW_PIXEL_OFFSET`. On mobile with a narrower left column, these values change. We'll create mobile variants of these constants and use the appropriate set based on screen size.

### Files modified:
1. **`index.html`** — rename all brand references
2. **`src/pages/Index.tsx`** — rename, responsive classes, mobile-aware timeline constants
3. **`src/components/TimezoneRow.tsx`** — accept `compact` prop, adjust widths
4. **`src/hooks/use-mobile.tsx`** — already exists, will be imported

