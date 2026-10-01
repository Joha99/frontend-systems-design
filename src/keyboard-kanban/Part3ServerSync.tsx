/**
 * Keyboard-Accessible Kanban (Part 3 of 4): Server Sync + Undo
 *
 * Start from your Part 2 code. Persist moves and add undo.
 *
 * API: moveCard(cardId, toColumnId, toIndex) → the affected columns
 *      Rejects ~15% of the time, and if the target column is at its limit.
 *
 * Requirements:
 * 1. Positions while a card is lifted stay local. Call the API ONCE, on
 *    drop, and only if the position actually changed.
 * 2. Drops are optimistic. If the API rejects, move the card back to where
 *    it was before the drop, show an error toast, and announce it.
 * 3. A failed move must not undo OTHER moves that succeeded after it.
 * 4. Cmd/Ctrl+Z undoes the last successful move (which is also a server
 *    call and can also fail).
 * 5. A card whose move is still saving can't be picked up again.
 *
 * Done when: you can make several quick moves in a row, some of which fail,
 * and the board always ends up matching what the server accepted.
 *
 * Time target: 40 minutes.
 */

import styles from "./KeyboardKanban.module.css";
import { fetchBoard, moveCard } from "./mockApi";

export const Part3ServerSync = () => {
  // TODO: implement
  void [fetchBoard, moveCard];

  return (
    <div>
      <h2>Keyboard-Accessible Kanban: Part 3</h2>
    </div>
  );
};
