/**
 * Tree Select (Systems Design)
 *
 * Build a tree-structured dropdown where items can be expanded/collapsed
 * and selected, with full keyboard navigation through nested levels.
 *
 * Requirements:
 * 1. Render a button that toggles a dropdown. The dropdown displays a tree
 *    of items (3 levels deep, ~30 items total) representing a file system.
 * 2. Folders can be expanded/collapsed. Files are leaf nodes.
 * 3. Keyboard navigation:
 *    - Arrow Down/Up: move focus to the next/previous visible item.
 *    - Arrow Right: expand a collapsed folder, or move to its first child if expanded.
 *    - Arrow Left: collapse an expanded folder, or move to the parent.
 *    - Home/End: focus first/last visible item.
 *    - Enter: select the focused item and close dropdown.
 *    - Escape: close dropdown without selecting.
 *    - Type-ahead: typing a character focuses the next matching visible item.
 * 4. Focus management:
 *    - Roving tabIndex (only focused item has tabIndex={0}).
 *    - On open, focus the selected item (or the first item).
 *    - On close, return focus to the trigger button.
 *    - Collapsing a folder that contains the focused item moves focus to the folder.
 * 5. ARIA: role="tree", role="treeitem", aria-expanded, aria-level, aria-selected.
 * 6. Show the selected item's full path in the trigger button.
 *
 * Time target: 35 minutes.
 */

import "./TreeSelect.css";

export const TreeSelect = () => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Tree Select</h2>
    </div>
  );
};
