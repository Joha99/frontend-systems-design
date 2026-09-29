/**
 * Keyboard-Accessible Kanban (Part 1 of 4): Board + Focus Navigation
 *
 * Load the board and make every card reachable from the keyboard.
 *
 * API: fetchBoard() → { columns, cards }  (see ./mockApi.ts)
 *
 * Requirements:
 * 1. Load the board on mount (loading + error states). Render columns
 *    left to right, cards top to bottom.
 * 2. Store it NORMALIZED: cards by id, each column holding an ordered array
 *    of card ids.
 * 3. Every card is focusable. Tab/Shift+Tab moves between cards in DOM order.
 * 4. ArrowUp/ArrowDown moves focus within a column (stop at the ends).
 *    ArrowLeft/ArrowRight moves focus to the adjacent column, to the card at
 *    the same index, clamped to that column's length. Skip empty columns.
 * 5. Use ONE keydown handler on the board, not one per card.
 *
 * Done when: you can reach every card with only the arrow keys and
 * nothing breaks at the edges or on an empty column.
 *
 * Time target: 35 minutes.
 */

import styles from "./KeyboardKanban.module.css";
import { fetchBoard } from "./mockApi";

export const Part1Board = () => {
  // TODO: implement
  void [fetchBoard];

  return <div>Keyboard-Accessible Kanban: Part 1</div>;
};
