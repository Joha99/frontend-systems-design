/**
 * Inbox Triage (Part 2 of 3): Selection, Search + Shortcut Map
 *
 * Start from your Part 1 code. Add multi-select and a proper shortcut system.
 *
 * Requirements:
 * 1. Build shortcuts as a MAP from key combo to handler, not an if/else
 *    chain. The ? overlay lists shortcuts generated from that same map.
 * 2. Selection is separate from the cursor:
 *    - x toggles selection of the cursor row (checkbox shown).
 *    - Shift+j / Shift+k extends the selection from an ANCHOR row to the
 *      new cursor row. Shift+click does the same with the mouse.
 *    - Escape clears the selection.
 * 3. / focuses a search box that filters loaded threads by sender or
 *    subject. j/k and range selection work on the FILTERED list.
 *    Escape in the search box blurs it.
 * 4. Shortcuts must NOT fire while typing in the search box.
 * 5. Accessibility: listbox (or grid) roles with aria-selected.
 *
 * Done when: you can search "github", select a range with Shift+j, and
 * clear it with Escape, all without the mouse.
 *
 * Time target: 45 minutes.
 */

import styles from "./InboxTriage.module.css";
import { fetchThreads, setRead } from "./mockApi";

export const Part2SelectionAndShortcuts = () => {
  // TODO: implement
  void [fetchThreads, setRead];

  return (
    <div>
      <h2>Inbox Triage: Part 2</h2>
    </div>
  );
};
