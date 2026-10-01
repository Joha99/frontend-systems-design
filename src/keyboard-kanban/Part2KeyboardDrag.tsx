/**
 * Keyboard-Accessible Kanban (Part 2 of 4): Keyboard Drag and Drop
 *
 * Start from your Part 1 code. Add moving cards with the keyboard.
 * Changes are LOCAL ONLY in this part (no server calls).
 *
 * Requirements:
 * 1. Write one local operation, moveCard(cardId, toColumnId, toIndex), and
 *    use it for every kind of move.
 * 2. Space on a focused card PICKS IT UP (visually lifted).
 *    While lifted:
 *    - ArrowUp/Down moves it within its column.
 *    - ArrowLeft/Right moves it to the adjacent column at the closest index.
 *    - Space DROPS it. Escape CANCELS and returns it to where it was picked
 *      up (same column and index).
 *    Focus stays on the moving card the whole time.
 * 3. WIP limits: a column with a `limit` that is full can't be entered. The
 *    card stays put.
 * 4. Announce each step in an aria-live region, e.g.
 *    "Picked up Fix login bug. Position 2 of 4 in To Do."
 *    "Moved to In Progress, position 1 of 3." / "In Progress is full."
 *    "Dropped." / "Move cancelled. Returned to To Do, position 2."
 *
 * Done when: a screen reader user could move a card to any valid spot and
 * know where it is at every step.
 *
 * Time target: 45 minutes.
 */

import styles from "./KeyboardKanban.module.css";
import { fetchBoard } from "./mockApi";

export const Part2KeyboardDrag = () => {
  // TODO: implement
  void [fetchBoard];

  return (
    <div>
      <h2>Keyboard-Accessible Kanban: Part 2</h2>
    </div>
  );
};
