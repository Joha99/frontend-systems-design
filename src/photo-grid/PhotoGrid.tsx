/**
 * Responsive Photo Grid: Keyboard Navigation + Selection
 *
 * Build a Google Photos–style grid that you can drive entirely from the
 * keyboard. The catch: the number of columns comes from CSS
 * (auto-fill), so it changes when the window is resized and JavaScript
 * isn't told what it is.
 *
 * API: fetchPhotos(cursor | null) → { photos, nextCursor }  (60 per page, 250 total)
 *      deletePhotos(ids) → rejects ~15% of the time
 *      Each photo has { id, title, color, takenAt }. Render a colored tile
 *      with the title; no real images needed.
 *
 * Requirements:
 * 1. Layout: use the provided `.grid` class (CSS grid, auto-fill columns).
 *    Do NOT hardcode a column count in JS.
 *
 * 2. Focus: roving tabIndex (only the focused tile has tabIndex=0) and ONE
 *    delegated keydown handler on the grid.
 *    - ← / → move to the previous / next photo, wrapping across rows.
 *    - ↑ / ↓ move to the photo directly above / below. The last row is
 *      usually shorter: ↓ from a column the last row doesn't reach goes to
 *      the LAST photo. ↑ from the first row and ↓ from the last row do nothing.
 *    - Home / End go to the start / end of the current ROW.
 *      Ctrl+Home / Ctrl+End go to the first / last photo.
 *    - PageUp / PageDown move by as many rows as fit in the viewport,
 *      staying in the same column.
 *    - The focused tile is always scrolled into view (without jumping the
 *      page when it's already visible).
 *
 * 3. Resizing: when the window is resized and the column count changes,
 *    the SAME photo stays focused and ↑ / ↓ use the new column count right
 *    away.
 *
 * 4. Selection:
 *    - Space toggles the focused photo. Cmd/Ctrl+click toggles one photo.
 *    - Shift+arrow extends a range from an ANCHOR to the focused photo
 *      (like a text editor: moving back toward the anchor shrinks it).
 *      Shift+click selects anchor → clicked.
 *    - Plain click / plain arrow moves focus without changing the
 *      selection. Cmd/Ctrl+A selects all LOADED photos. Escape clears.
 *    - Show "3 selected" in a toolbar.
 *
 * 5. Pagination: load the first page on mount. When focus gets within 2
 *    rows of the end, load the next page. Never fetch the same page twice.
 *    Show a retry button if a page fails.
 *
 * 6. Delete: the Delete / Backspace key deletes the selection (or the
 *    focused photo if nothing is selected). Optimistic: remove right away,
 *    restore in the same positions if the API rejects. Afterward, focus
 *    goes to the photo that took the focused one's place (or the new last
 *    photo).
 *
 * 7. ARIA: role="grid" isn't quite right for a reflowing list. Pick the
 *    roles (listbox + option with aria-multiselectable, or grid with rows)
 *    and be ready to explain the trade-off.
 *
 * Done when: at 4 columns and at 6 columns (resize the window), ↓ from
 * the 3rd tile of the second-to-last row reaches the right tile; Shift+→
 * ×3 then Shift+← ×1 selects 3 photos; arrowing down loads all 250 photos;
 * and deleting 5 photos with a failure puts them back in order.
 *
 * Think about:
 * - The photos are a 1D array but the keys move in 2D. Given the column
 *   count, what's the index math for "row of i", "column of i", and "the
 *   tile below i"?
 * - How do you READ the column count from the page? (Two ideas: compare
 *   tiles' offsetTop, or read the grid's computed style.) When do you need
 *   to re-read it? Should it live in state or a ref?
 * - Track focus and the anchor by index or by photo id? What breaks with
 *   each after a delete or a page load?
 * - Is the selection a Set or an array? What does Shift-range do to it?
 *
 * Stretch:
 * - Group photos by day with sticky date headers. ↑ / ↓ now need to cross
 *   headers and short rows at the end of each day.
 * - Virtualize: only render rows near the viewport.
 *
 * Time target: 60 minutes.
 */

import styles from "./PhotoGrid.module.css";
import { deletePhotos, fetchPhotos } from "./mockApi";

export const PhotoGrid = () => {
  // TODO: implement
  void [styles, fetchPhotos, deletePhotos];

  return (
    <div>
      <h2>Responsive Photo Grid</h2>
    </div>
  );
};
