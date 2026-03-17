

## Plan

1. **`index.html`**: Add `interactive-widget=resizes-content` to the viewport meta tag to handle keyboard overlap.

2. **`src/pages/Index.tsx`**: Update the sheet content:
   - Remove `min-h-[60vh]` (make sheet smaller, content-driven height)
   - Remove the `<SheetTitle>` label
   - Add ~100px vertical margin around the search field (`my-24` or similar)

