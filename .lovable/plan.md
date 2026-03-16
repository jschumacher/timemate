

## Plan: Greyed-out Time Lozenge Pin Markers with Tap-to-Select and Drag

### Current State
- Pinned lines are rendered as thin vertical lines with `pointer-events-none` (line 520)
- The "pinned label" lozenge (lines 468-478) only shows the **last** pinned time, above the timeline
- On mobile, tapping near a pin removes it — user wants this removed
- No way to select or drag existing pins

### Design

Each pinned line gets a **lozenge marker at the top** (same style as the "now" and "hover" lozenges) but **greyed out** when inactive. Tapping a marker **selects** it (activates it — shows in accent color). Once selected, the user can **drag** it to a new position. Tapping elsewhere deselects.

### Changes to `src/pages/Index.tsx`

**1. New state:**
- `selectedPinIndex: number | null` — which pin is currently selected/active
- `draggingPinIndex: number | null` — which pin is being dragged  
- `dragPinOffsetRef` — tracks the live offset during drag

**2. Replace the pinned label section (lines 467-478):**
Instead of showing only the last pinned lozenge, render a lozenge for **every** pin at its X position:
- **Inactive (not selected):** greyed out lozenge (`bg-muted/40 border-muted text-muted-foreground/50`) showing the time
- **Active (selected):** accent-colored lozenge (`bg-hover-line/20 border-hover-line/40 text-hover-line`) — same style as current
- These lozenges have `pointer-events-auto` so they're tappable/draggable

**3. Remove tap-to-unpin on mobile (lines 312-314):**
Tapping near an existing pin in `handleTouchEnd` currently removes it. Remove that behavior — tapping on empty space still adds a new pin.

**4. Touch handling on pin markers:**
- `onTouchStart` on a lozenge: set `selectedPinIndex` to that pin's index, begin tracking for drag
- `onTouchMove` on a lozenge: update the pin's offset in real-time (snapped to 15-min), set `draggingPinIndex`
- `onTouchEnd` on a lozenge: finalize the new offset in `pinnedOffsets`, clear `draggingPinIndex`
- These handlers call `e.stopPropagation()` so they don't trigger the container's scroll/pin-add logic

**5. Click handling on pin markers (desktop):**
- Click on a lozenge toggles `selectedPinIndex`
- When selected + mouse drag on lozenge → move the pin

**6. Pinned line rendering (lines 516-523):**
Keep vertical lines but update the selected one to be more prominent (thicker/brighter).

**7. Remove pin via the pinned options panel** (already exists via X button, lines 578-584) — this is the only way to delete pins now.

### Files modified
1. **`src/pages/Index.tsx`** — new state, pin lozenge rendering, updated touch/click handlers

