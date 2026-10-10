/**
 * File Browser with Grouping (Part 3 of 4): Keyboard Navigation
 *
 * Start from your Part 2 code. Make the grouped list fully usable from
 * the keyboard, like Finder.
 *
 * Requirements:
 * 1. One row is "focused" at a time (roving tabIndex: only it has
 *    tabIndex=0). Group headers count as rows. Use ONE delegated keydown
 *    handler on the list, not one per row.
 * 2. ↑ / ↓ move through visible rows only: rows inside a collapsed group
 *    are skipped. Home / End go to the first / last visible row.
 * 3. On a group header: ← collapses, → expands, Enter / Space toggles.
 *    On an item: ← moves focus to its group's header.
 * 4. Enter on a folder opens it and focuses its first row. Backspace (or
 *    Cmd/Alt + ↑) goes up to the parent folder and focuses the folder you
 *    just left.
 * 5. Type-ahead: typing letters quickly (within 500ms) jumps to the next
 *    visible row whose name starts with what was typed ("no" → "notes1").
 *    Pressing the same letter again cycles through matches.
 * 6. Focus never gets lost: if the focused row disappears (its group is
 *    collapsed with the mouse, or you change Group by), move focus
 *    somewhere sensible. Say what you picked and why.
 * 7. ARIA: headers are buttons with aria-expanded; the list and groups
 *    have roles and labels a screen reader can follow.
 *
 * Done when: you can open "docs/meeting-notes", type "notes1" to land on
 * notes1, Backspace out with "meeting-notes" focused, and collapse a group
 * containing the focused row without focus jumping to <body>.
 *
 * Think about:
 * - The grouped structure is nested (groups → items), but ↑ / ↓ moves
 *   through a FLAT list. What derived array makes every key handler a
 *   one-liner on an index?
 * - Track focus by row id or by index? What happens to each when a group
 *   above the focused row collapses?
 *
 * Time target: 45 minutes.
 */

import styles from "./FileGrouping.module.css";
import { fetchEntries } from "./mockApi";

export const Part3KeyboardNav = () => {
  // TODO: implement
  void [styles, fetchEntries];

  return (
    <div>
      <h2>File Browser with Grouping: Part 3</h2>
    </div>
  );
};
