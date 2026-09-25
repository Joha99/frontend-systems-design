/**
 * Inbox Triage (Gmail-style keyboard shortcuts)
 *
 * Build an email list you can triage entirely from the keyboard, with
 * multi-select, optimistic actions, and undo.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchThreads(cursor | null) → { threads, nextCursor }   25 per page
 *   archiveThreads(ids, archive = true) → resolves or REJECTS (~20% of
 *                                  the time). Pass false to unarchive.
 *   setStarred(ids, starred)     → resolves or REJECTS (~20% of the time)
 *   setRead(ids, read)           → always resolves
 *
 * Requirements:
 * 1. Load the first page on mount. When the cursor gets within 5 rows of
 *    the end of the loaded list, fetch the next page. Never fetch the same
 *    page twice.
 * 2. Keep threads normalized (by id) plus an ordered list of ids.
 * 3. There is a single "cursor" row (focused, outlined) that is separate
 *    from "selection" (checkboxes). Shortcuts:
 *    - j / k: move the cursor down / up (scroll it into view).
 *    - x: toggle selection of the cursor row.
 *    - Shift+j / Shift+k: extend the selection from the anchor to the new
 *      cursor row. Shift+click does the same with the mouse.
 *    - Enter or o: open the cursor thread in a reading pane (marks it read).
 *      u: close the pane and return to the list.
 *    - e: archive. s: toggle star. Shift+i / Shift+u: mark read / unread.
 *      These act on the SELECTION if it's not empty, else the cursor row.
 *    - z: undo the last action.
 *    - /: focus the search box. Escape: clear selection (or blur search).
 *    - ?: toggle a shortcuts help overlay.
 *    Shortcuts must NOT fire while typing in the search box.
 * 4. Optimistic updates: the UI changes immediately. If the API rejects,
 *    roll back ONLY the affected threads and show an error toast. Other
 *    actions that happened in the meantime must not be undone.
 * 5. After archiving, the cursor moves to the next remaining thread
 *    (or the previous one if it was last).
 * 6. Each action shows a toast "Archived 3 conversations · Undo" for 5s.
 *    z or clicking Undo reverses it (also via the API).
 * 7. The search box filters loaded threads by sender or subject. j/k and
 *    selection ranges operate on the FILTERED list.
 * 8. Accessibility: the list uses listbox (or grid) roles with
 *    aria-selected; action results are announced in a live region.
 *
 * Data structure focus:
 * - Selection as a Set of ids plus an anchor id for range selection.
 * - An undo stack of actions with enough info to invert each one.
 * - A shortcut map (key → handler) instead of a giant if/else chain.
 *
 * Discussion questions:
 * - How would you design a shortcut system shared by many components
 *   (scopes, conflicts, a help screen generated from the registry)?
 * - Two rapid actions on the same thread, then the first one fails.
 *   What should the UI show?
 * - How would you keep the list in sync when new mail arrives while the
 *   user is mid-selection?
 *
 * Time target: 90 minutes.
 */

import styles from "./InboxTriage.module.css";
import {
  archiveThreads,
  fetchThreads,
  setRead,
  setStarred,
  type Thread,
} from "./mockApi";

export const InboxTriage = () => {
  // TODO: implement
  void [archiveThreads, fetchThreads, setRead, setStarred];
  const threads: Thread[] = [];

  return <div>Inbox Triage ({threads.length} threads)</div>;
};
