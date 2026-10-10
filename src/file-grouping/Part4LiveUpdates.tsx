/**
 * File Browser with Grouping (Part 4 of 4): Live Updates
 *
 * Start from your Part 3 code. Other people are editing this file system:
 * apply their changes as they stream in.
 *
 * API: subscribeToFileEvents(onEvent) → unsubscribe
 *      { type: "created", entry }
 *      { type: "modified", id, size, modifiedAt }
 *      { type: "moved", id, newPath }      (rename = move to the same folder)
 *      { type: "deleted", id }
 *   Events arrive every 1.5–3s. About 1 in 8 ticks is a BURST of 25 at once.
 *
 * Requirements:
 * 1. Subscribe after the first load; unsubscribe on unmount.
 * 2. Apply each event to your normalized tree WITHOUT rebuilding the whole
 *    tree from scratch:
 *    - created: may land in a folder you already have, or need new ones.
 *    - moved: may create new folders (e.g. "archive/2026" doesn't exist
 *      yet). The old folder keeps existing even if it's now empty.
 *    - deleted: remove the file; its folder stays.
 * 3. Folder aggregates (size, latest modified, item count) stay correct.
 *    Updating them must touch only the affected folders and their
 *    ancestors, not every folder.
 * 4. Grouping updates live: a file modified now moves into "Today"; a file
 *    that grows past 1 MB moves from Small to Medium.
 * 5. A burst of 25 events causes ONE re-render, not 25.
 * 6. The user's place is kept:
 *    - Focus stays on the same row (by id) even if it moves within the list.
 *    - If the focused file is deleted or moved out of this folder, focus
 *      goes to a sensible neighbor.
 *    - If the folder being viewed no longer exists, go to the nearest
 *      ancestor that still exists.
 * 7. Briefly highlight rows that changed (1s).
 *
 * Done when: leave it running for 2 minutes, then reload and compare.
 * Every folder's size, count and modified date match a fresh build from
 * fetchEntries() (the server's state), and keyboard focus never jumped
 * to <body> while events streamed in.
 *
 * Discussion: a move is "remove from old parent + add to new parent".
 * Which aggregates need a full recompute of a folder (hint: latest
 * modified, when the newest file leaves) and which can be fixed with
 * simple + / − deltas? What would you do with 10,000 events per second?
 *
 * Stretch: drag a file onto a folder row to move it (optimistic, with
 * rollback if you add a failing moveEntry() to the mock API).
 *
 * Time target: 50 minutes.
 */

import styles from "./FileGrouping.module.css";
import { fetchEntries, subscribeToFileEvents } from "./mockApi";

export const Part4LiveUpdates = () => {
  // TODO: implement
  void [styles, fetchEntries, subscribeToFileEvents];

  return (
    <div>
      <h2>File Browser with Grouping: Part 4</h2>
    </div>
  );
};
