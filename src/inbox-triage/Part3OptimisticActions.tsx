/**
 * Inbox Triage (Part 3 of 3): Optimistic Actions + Undo
 *
 * Start from your Part 2 code. Add triage actions.
 *
 * API: archiveThreads(ids, archive = true)  → rejects ~20% of the time
 *      setStarred(ids, starred)             → rejects ~20% of the time
 *      setRead(ids, read)                   → always resolves
 *
 * Requirements:
 * 1. e archives, s toggles star, Shift+i / Shift+u marks read / unread.
 *    They act on the SELECTION if it's not empty, otherwise the cursor row.
 * 2. All actions are optimistic. If the API rejects, roll back ONLY the
 *    affected threads and show an error toast. Other actions taken in the
 *    meantime must be kept.
 * 3. After archiving, the cursor moves to the next remaining thread (or
 *    the previous one if it was the last).
 * 4. Each action shows a toast like "Archived 3 conversations · Undo" for
 *    5s. z or clicking Undo reverses the last action (also via the API).
 * 5. Announce results in an aria-live region.
 *
 * Done when: archive 3 threads, star 1, then undo, and the list is right
 * even when some of those calls failed.
 *
 * Discussion: two quick actions on the same thread, then the first one
 * fails. What should the UI show?
 *
 * Time target: 45 minutes.
 */

import styles from "./InboxTriage.module.css";
import { archiveThreads, fetchThreads, setRead, setStarred } from "./mockApi";

export const Part3OptimisticActions = () => {
  // TODO: implement
  void [fetchThreads, setRead, archiveThreads, setStarred];

  return (
    <div>
      <h2>Inbox Triage: Part 3</h2>
    </div>
  );
};
