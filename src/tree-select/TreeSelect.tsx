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
 *    - Arrow Right/Left: expand/collapse folders.
 *    - Enter: select the focused item and close dropdown.
 *    - Escape: close dropdown without selecting.
 * 4. Roving tabIndex: only the focused item has tabIndex={0}, others have -1.
 * 5. ARIA: role="tree", role="treeitem", aria-expanded, aria-level, aria-selected.
 * 6. Show the selected item's label in the trigger button.
 *
 * Time target: 35 minutes.
 */

import { useState } from "react";
import styles from "./TreeSelect.module.css";
import { FILE_TREE, type TreeNode } from "./data";

const File = ({
  file,
  onFileClick,
  ariaLevel,
  selectedId,
}: {
  file: TreeNode;
  onFileClick: (fileId: TreeNode["id"]) => void;
  ariaLevel: number;
  selectedId?: TreeNode["id"];
}) => {
  const [open, setOpen] = useState(true);

  if (!file.children) {
    return (
      <button
        className={styles.file}
        onClick={() => onFileClick(file.id)}
        role="treeitem"
        aria-level={ariaLevel}
        aria-selected={selectedId === file.id}
      >
        {file.label}
      </button>
    );
  }

  const onToggleFolder = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div
      className={styles.folder}
      role="treeitem"
      aria-level={ariaLevel}
      aria-expanded={open}
    >
      <div className={styles.folderHeader}>
        <button className={styles.folderToggle} onClick={onToggleFolder}>
          {open ? "▲" : "▼"}
        </button>
        <h5>
          {file.label}/ ({file.children.length})
        </h5>
      </div>

      {open && (
        <div className={styles.nestedFiles} role="group">
          {file.children.map((child) => {
            return (
              <File
                key={child.id}
                file={child}
                onFileClick={onFileClick}
                ariaLevel={ariaLevel + 1}
                selectedId={selectedId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TreeSelect = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TreeNode["id"]>();

  const onAnchorClick = () => {
    setOpen((prev) => !prev);
  };

  const onFileClick = (fileId: TreeNode["id"]) => {
    setSelected(fileId);
    setOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <h2>Tree Select</h2>
      <button className={styles.anchor} onClick={onAnchorClick}>
        {selected ? `Selected: ${selected}` : "Open dropdown"}
      </button>
      {open && (
        <div className={styles.dropdown} role="tree">
          {FILE_TREE.map((file) => {
            return (
              <File
                key={file.id}
                file={file}
                onFileClick={onFileClick}
                ariaLevel={1}
                selectedId={selected}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
