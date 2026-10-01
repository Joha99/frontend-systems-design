/**
 * Week Calendar (Part 1 of 4): Week Grid + Overlap Layout
 *
 * Render one week and lay out overlapping events. This is the core algorithm.
 *
 * API: fetchEvents(fromISO, toISO) → events starting in [from, to)  (slow)
 *
 * Requirements:
 * 1. Render 7 day columns (Mon–Sun) by 24 hours in 30-minute rows. Start
 *    scrolled to 8:00. Show a red "now" line on today's column.
 * 2. Fetch this week's events (loading state) and position each one by its
 *    start/end time.
 * 3. Overlap layout, per day:
 *    - Group events into clusters of TRANSITIVELY overlapping events.
 *    - In a cluster, give each event the leftmost column that is free at its
 *      start time.
 *    - Width = 1 / (number of columns in its cluster).
 *    - Touching events (one ends 10:00, next starts 10:00) don't overlap.
 * 4. Keep the layout logic in pure functions outside the component.
 *
 * Done when: Monday's chain, Wednesday's touching events and Friday's 4-way
 * overlap all look like Google Calendar.
 *
 * Discussion: this is "meeting rooms II". Where could a min-heap help?
 *
 * Time target: 45 minutes.
 */

import styles from "./WeekCalendar.module.css";
import { fetchEvents } from "./mockApi";

export const Part1OverlapLayout = () => {
  // TODO: implement
  void [fetchEvents];

  return (
    <div>
      <h2>Week Calendar: Part 1</h2>
    </div>
  );
};
