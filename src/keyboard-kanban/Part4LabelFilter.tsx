/**
 * Keyboard-Accessible Kanban (Part 4 of 4): Label Filter
 *
 * Start from your Part 3 code. Add filtering that works with keyboard moves.
 *
 * Requirements:
 * 1. A dropdown filters visible cards by label (all / bug / feature / chore).
 * 2. Arrow-key focus navigation only visits VISIBLE cards.
 * 3. Moving a lifted card "down one" moves it past the next VISIBLE card,
 *    and it must land at the right index in the FULL (unfiltered) column.
 *    The API's toIndex is always a FULL-list index.
 * 4. Announcements use visible positions ("position 2 of 3 bugs").
 *
 * Done when: filtering by "bug", moving a bug card down one, then clearing
 * the filter shows it directly after the bug card it passed.
 *
 * Discussion: how would you store order on the server so two users moving
 * cards at the same time don't overwrite each other (fractional indexing)?
 *
 * Time target: 35 minutes.
 */

import styles from "./KeyboardKanban.module.css";
import { fetchBoard, moveCard } from "./mockApi";

export const Part4LabelFilter = () => {
  // TODO: implement
  void [fetchBoard, moveCard];

  return <div>Keyboard-Accessible Kanban: Part 4</div>;
};
