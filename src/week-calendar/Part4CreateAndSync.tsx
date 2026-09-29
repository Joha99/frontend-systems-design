/**
 * Week Calendar (Part 4 of 4): Create Events + Server Sync
 *
 * Start from your Part 3 code. Add creating events and persist everything.
 *
 * API: createEvent({ title, start, end }) → event with a server id
 *      updateEvent(id, patch) → updated event
 *      deleteEvent(id) → void
 *      All reject ~15% of the time.
 *
 * Requirements:
 * 1. Create: Enter on an empty slot creates a 30-minute event there. Click
 *    and drag on empty space creates one snapped to 15 minutes. Then ask
 *    for a title inline.
 * 2. All writes are optimistic, with rollback and an error toast on failure.
 * 3. Holding an arrow key must NOT send a request per press. Save once the
 *    user stops (e.g. 500ms idle) or deselects the event.
 * 4. A new event has a temporary id until createEvent resolves. Moves made
 *    before then must still be saved correctly against the real id.
 * 5. Keep the week cache from Part 2 in sync with these changes.
 *
 * Done when: create an event, immediately move it twice, and after a
 * refetch it's in the right place (or clearly rolled back on failure).
 *
 * Time target: 45 minutes.
 */

import styles from "./WeekCalendar.module.css";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "./mockApi";

export const Part4CreateAndSync = () => {
  // TODO: implement
  void [fetchEvents, createEvent, updateEvent, deleteEvent];

  return <div>Week Calendar: Part 4</div>;
};
