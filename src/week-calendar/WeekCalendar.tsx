/**
 * Week Calendar with Overlapping Events (Google Calendar week view)
 *
 * Build a 7-day week view that lays out overlapping events side by side
 * and supports creating and moving events with mouse and keyboard.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchEvents(fromISO, toISO)  → events starting in [from, to)  (slow)
 *   createEvent({ title, start, end })     → event with server id
 *   updateEvent(id, patch)                  → updated event
 *   deleteEvent(id)                         → void
 *   Writes reject ~15% of the time. The current week has seeded overlaps;
 *   nearby weeks have a daily standup.
 *
 * Requirements:
 * 1. Render 7 day columns (Mon–Sun) by 24 hours, 30-minute rows. Only
 *    8:00–20:00 needs to be visible without scrolling; start scrolled to 8:00.
 *    Show a red "now" line on today's column. Prev/Next week buttons and
 *    a "Today" button (keyboard shortcut: t).
 * 2. Fetch the visible week's events. CACHE fetched weeks (going back to a
 *    week shouldn't refetch), prefetch the previous and next week, and
 *    ignore responses for a week the user already navigated away from.
 * 3. OVERLAP LAYOUT, which is the core algorithm. Within a day:
 *    - Group events into clusters of transitively overlapping events.
 *    - Within a cluster, assign each event the leftmost column that is free
 *      at its start time.
 *    - Each event's width = 1 / (number of columns in its cluster).
 *    Events that touch (one ends at 10:00, next starts at 10:00) do NOT overlap.
 *    Recompute only the affected day(s) when an event changes.
 * 4. Mouse: click-and-drag on empty space creates an event snapped to
 *    15 minutes, then prompts inline for a title. Click an event to select it.
 * 5. Keyboard: the grid is ONE tab stop (roving tabindex over slots).
 *    - Arrow keys move the focused slot (Up/Down = 30 min, Left/Right = day).
 *    - Enter on an empty slot creates a 30-minute event there.
 *    - Tab from the grid moves into the events of the focused day; Enter or
 *      Space selects an event.
 *    - With an event selected: ArrowUp/Down moves it by 15 min,
 *      ArrowLeft/Right by a day, Shift+ArrowUp/Down changes its END by
 *      15 min (minimum 15 min). Delete/Backspace removes it.
 *      Escape deselects and returns focus to its slot.
 * 6. All writes are optimistic with rollback on failure (error toast).
 *    Holding an arrow key must NOT send a request per keypress: save once
 *    the user stops moving the event (e.g. 500ms idle) or deselects it.
 *    A newly created event has a temporary id until the server responds;
 *    edits made before then must still be saved correctly.
 * 7. Announce changes in a live region ("Design review moved to Tuesday
 *    10:30 to 11:30").
 *
 * Stretch:
 * - Events spanning midnight render in both days.
 * - Drag an event's bottom edge to resize.
 *
 * Data structure focus:
 * - Interval overlap clustering (sort by start, sweep).
 * - Greedy column assignment (like "meeting rooms II"; consider a min-heap
 *   of column end times).
 * - A cache keyed by week start; events grouped by day key for cheap
 *   per-day recompute.
 *
 * Discussion questions:
 * - How do you handle time zones and DST (a 23-hour day)?
 * - A user has 5,000 events. What do you fetch and render?
 * - How would you make the layout stable (events don't jump columns)
 *   while dragging?
 *
 * Time target: 120 minutes.
 */

import styles from "./WeekCalendar.module.css";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "./mockApi";

export const WeekCalendar = () => {
  // TODO: implement
  void [fetchEvents, createEvent, updateEvent, deleteEvent];

  return <div>Week Calendar</div>;
};
