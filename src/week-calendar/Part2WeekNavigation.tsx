/**
 * Week Calendar (Part 2 of 4): Week Navigation + Caching
 *
 * Start from your Part 1 code. Add moving between weeks efficiently.
 *
 * Requirements:
 * 1. Prev / Next week buttons and a Today button (keyboard shortcut: t).
 * 2. CACHE fetched weeks by week start. Going back to a week you've seen
 *    shows it instantly with no refetch.
 * 3. After a week loads, PREFETCH the previous and next weeks.
 * 4. Clicking Next quickly several times must never show a stale week: a
 *    response for a week the user already left is stored in the cache but
 *    must not replace what's on screen.
 * 5. Show a loading state only for weeks that aren't cached yet.
 *
 * Done when: clicking Next 5 times fast, then Prev 5 times, shows the right
 * week each time and the network tab shows each week fetched once.
 *
 * Time target: 35 minutes.
 */

import styles from "./WeekCalendar.module.css";
import { fetchEvents } from "./mockApi";

export const Part2WeekNavigation = () => {
  // TODO: implement
  void [fetchEvents];

  return (
    <div>
      <h2>Week Calendar: Part 2</h2>
    </div>
  );
};
