/**
 * Tree Select (File Browser / Nested Dropdown)
 *
 * Build a tree-structured dropdown where items can be expanded/collapsed
 * and selected, with full keyboard navigation through nested levels.
 *
 * Requirements:
 * 1. Render a button that toggles a dropdown. The dropdown displays a tree
 *    of items (3 levels deep, ~30 items total). Example data: a file system
 *    with folders containing subfolders and files.
 *    { label: "src", children: [{ label: "components", children: [...] }, ...] }
 * 2. Folders can be expanded/collapsed by clicking the expand arrow or pressing
 *    Enter/Space on a focused folder. Files are leaf nodes (no expand).
 * 3. Keyboard navigation:
 *    - Arrow Down: move focus to the next VISIBLE item (skip collapsed children).
 *    - Arrow Up: move focus to the previous VISIBLE item.
 *    - Arrow Right on a collapsed folder: expand it.
 *    - Arrow Right on an expanded folder: move focus to its first child.
 *    - Arrow Left on a child: move focus to its parent folder.
 *    - Arrow Left on an expanded folder: collapse it.
 *    - Arrow Left on a collapsed root-level folder: do nothing.
 *    - Home: focus first item. End: focus last visible item.
 *    - Enter: select the focused item (file or folder) and close dropdown.
 *    - Escape: close dropdown without selecting.
 *    - Type-ahead: typing a character focuses the next item starting with
 *      that letter (among visible items only).
 * 4. Focus management:
 *    - Use roving tabIndex on the tree items (only focused item has tabIndex={0}).
 *    - When the dropdown opens, focus the previously selected item
 *      (or the first item if nothing selected).
 *    - When it closes, return focus to the trigger button.
 *    - Expanding a folder does NOT move focus (stay on the folder).
 *    - Collapsing a folder that contains the focused item: move focus to the folder.
 * 5. The "visible items" list is a flattened view of the tree that changes when
 *    folders expand/collapse. You'll need to flatten the tree on every expand/collapse
 *    to know which item is "next" or "previous" for arrow key navigation.
 * 6. ARIA: role="tree" on the container, role="treeitem" on each item,
 *    aria-expanded on folders, aria-level for depth, aria-selected on the selected item.
 * 7. Show the selected item's full path in the trigger button (e.g. "src / components / Button.tsx").
 *
 * Focus concepts:
 * - Roving tabIndex on a dynamic list (items appear/disappear on expand/collapse)
 * - Flattening a tree to compute next/previous visible items
 * - Focus restoration on close
 * - Keyboard interaction that modifies the focusable set (expand changes visible items)
 * - stopPropagation for nested keyboard handlers
 *
 * Time target: 35 minutes.
 */

import "./TreeSelect.css";

export const TreeSelect = () => {
  return <div>Tree Select</div>;
};
