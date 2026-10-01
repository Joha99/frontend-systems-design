/**
 * Week Calendar (Part 3 of 4): Keyboard Grid + Moving Events
 *
 * Start from your Part 2 code. Make the calendar fully keyboard operable.
 * Changes are LOCAL ONLY in this part.
 *
 * Requirements:
 * 1. The grid is ONE tab stop with roving tabindex over the 30-minute
 *    slots. Arrow keys move the focused slot (Up/Down = 30 min,
 *    Left/Right = day).
 * 2. Tab from the grid moves into the focused day's events. Enter or
 *    Space selects an event.
 * 3. With an event selected:
 *    - ArrowUp/Down moves it by 15 min; ArrowLeft/Right by a day.
 *    - Shift+ArrowUp/Down changes its END by 15 min (minimum 15 min).
 *    - Delete/Backspace removes it.
 *    - Escape deselects and returns focus to its slot.
 * 4. Re-run the overlap layout only for the affected day(s).
 * 5. Announce changes in an aria-live region, e.g.
 *    "Design review moved to Tuesday 10:30 to 11:30".
 *
 * Done when: you can move Standup to Wednesday 14:00 and make it an hour
 * long using only the keyboard.
 *
 * Time target: 45 minutes.
 */

import styles from "./WeekCalendar.module.css";
import { fetchEvents } from "./mockApi";

export const Part3KeyboardGrid = () => {
  // TODO: implement
  void [fetchEvents];

  return (
    <div>
      <h2>Week Calendar: Part 3</h2>
    </div>
  );
};
