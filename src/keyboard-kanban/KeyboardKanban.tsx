/**
 * Keyboard-Accessible Kanban (keyboard drag and drop)
 *
 * Build a Kanban board where cards can be moved entirely from the
 * keyboard, with screen reader announcements and server sync. Do NOT use
 * the HTML Drag and Drop API; the keyboard flow is the focus.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchBoard()                          → { columns, cards }
 *   moveCard(cardId, toColumnId, toIndex) → the affected columns
 *     toIndex is in the FULL (unfiltered) column. Rejects ~15% of the time,
 *     and if the target column is at its WIP limit.
 *
 * Requirements:
 * 1. Load the board on mount. Store it normalized: cards by id, and each
 *    column holding an ordered list of card ids. One local
 *    moveCard(cardId, toColumnId, toIndex) operation should back every
 *    kind of move.
 * 2. Every card is focusable. Tab/Shift+Tab moves between cards in DOM
 *    order. ArrowUp/ArrowDown moves focus within a column; ArrowLeft/Right
 *    moves focus to the nearest card (same index, clamped) in the adjacent
 *    column.
 * 3. Keyboard drag:
 *    - Space on a focused card PICKS IT UP (visually lifted).
 *    - While lifted: ArrowUp/Down moves it within its column,
 *      ArrowLeft/Right moves it to the adjacent column at the closest index.
 *    - Space DROPS it. Escape CANCELS and returns it to where it was
 *      picked up (column and index).
 *    - Focus stays on the moving card the whole time.
 *    - Intermediate positions while lifted are LOCAL ONLY. Call the API
 *      once, on drop, and only if the position actually changed.
 * 4. Announce every step in an aria-live region, e.g.
 *    "Picked up Fix login bug. Position 2 of 4 in To Do."
 *    "Moved to In Progress, position 1 of 3."
 *    "Dropped." / "Move cancelled. Returned to To Do, position 2."
 * 5. WIP limits: columns may have a `limit`. A lifted card cannot enter a
 *    full column (it stays put and the live region explains why).
 * 6. Drops are optimistic. If moveCard rejects, put the card back where it
 *    was before the drop, show an error toast, and announce it. A failed
 *    move must not undo other moves that succeeded after it.
 * 7. Label filter: a dropdown filters visible cards by label. Moving a card
 *    while filtered must still land it at the right place in the FULL list
 *    (moving "down one" means past the next VISIBLE card).
 * 8. Cmd/Ctrl+Z undoes the last completed move (which is also a server move).
 *
 * Stretch:
 * - Mouse/touch drag using pointer events that shares moveCard().
 * - Disable picking up a card whose previous move is still saving.
 *
 * Data structure focus:
 * - Normalized board state; ordered id arrays per column.
 * - Mapping between filtered (visible) indexes and real indexes.
 * - Snapshot of the origin position for cancel/rollback; history for undo.
 *
 * Discussion questions:
 * - Why is the ARIA live region needed if the card keeps focus?
 * - How would you persist order on the server so concurrent moves by two
 *   users don't clobber each other? (fractional indexing vs. index arrays)
 * - How would you virtualize a column with 2,000 cards?
 *
 * Time target: 90 minutes.
 */

import styles from "./KeyboardKanban.module.css";
import { fetchBoard, moveCard } from "./mockApi";

export const KeyboardKanban = () => {
  // TODO: implement
  void [fetchBoard, moveCard];

  return <div>Keyboard Kanban</div>;
};
