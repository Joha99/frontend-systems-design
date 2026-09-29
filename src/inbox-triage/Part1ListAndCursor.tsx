/**
 * Inbox Triage (Part 1 of 3): List, Pagination + Cursor
 *
 * Render the inbox and move through it with the keyboard.
 *
 * API: fetchThreads(cursor | null) → { threads, nextCursor }  (25 per page)
 *      setRead(ids, read) → always resolves
 *
 * Requirements:
 * 1. Load the first page on mount. Keep threads normalized (by id) plus an
 *    ordered array of ids.
 * 2. A single "cursor" row is outlined. j / k moves it down / up and
 *    scrolls it into view.
 * 3. When the cursor is within 5 rows of the end, fetch the next page.
 *    Never fetch the same page twice, and stop when nextCursor is null.
 * 4. Enter or o opens the cursor thread in a reading pane and marks it
 *    read (optimistically). u closes the pane and returns to the list with
 *    the cursor where it was.
 * 5. Unread threads are bold. Show sender, subject, snippet and time.
 *
 * Done when: holding j scrolls through all 120 threads, loading pages
 * along the way with no duplicates.
 *
 * Time target: 40 minutes.
 */

import styles from "./InboxTriage.module.css";
import { fetchThreads, setRead } from "./mockApi";

export const Part1ListAndCursor = () => {
  // TODO: implement
  void [fetchThreads, setRead];

  return <div>Inbox Triage: Part 1</div>;
};
