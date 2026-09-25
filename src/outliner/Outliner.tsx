/**
 * Keyboard-Driven Outliner (Workflowy / Roam style)
 *
 * Build a nested bullet-list editor where every structural edit can be
 * done from the keyboard, with undo/redo and autosave.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchOutline()                        → { nodes (NESTED), version }
 *   saveChanges(changes, baseVersion)     → { savedAt, version }
 *     changes: { [id]: NodePatch | null }   (null = deleted)
 *     Rejects ~15% of the time, and with "CONFLICT" if baseVersion is stale.
 *
 * Requirements:
 * 1. Load the outline on mount (show a loading state). Render it as a
 *    nested bulleted list. Each bullet is an editable single-line input.
 *    Bullets with children show a collapse arrow.
 * 2. Store the tree NORMALIZED (a lookup of nodes by id, each node knowing
 *    its parent and its ordered children) instead of the nested API shape.
 *    Every operation below should touch only the nodes involved, not
 *    rebuild the tree.
 * 3. Derive a "visible order" list (depth-first, skipping children of
 *    collapsed nodes). Up/Down navigation walks this list.
 * 4. Keyboard (while focused in a bullet's input):
 *    - ArrowUp / ArrowDown: focus previous / next visible bullet.
 *    - Enter: create an empty sibling directly after the current bullet
 *      and focus it. (If the current bullet is expanded and has children,
 *      create it as the FIRST child instead.)
 *    - Tab: indent: make the bullet the last child of its previous
 *      sibling. No-op if there is no previous sibling. Children move with it.
 *    - Shift+Tab: outdent: make the bullet the next sibling of its parent.
 *      No-op at the top level.
 *    - Backspace on an EMPTY bullet with no children: delete it and focus
 *      the previous visible bullet (caret at end of its text).
 *    - Cmd/Ctrl+ArrowUp: collapse. Cmd/Ctrl+ArrowDown: expand.
 *    - Alt+Shift+ArrowUp / ArrowDown: move the bullet (with its subtree)
 *      above / below its sibling. Stays within the same parent.
 *    - Cmd/Ctrl+Z: undo. Cmd/Ctrl+Shift+Z: redo.
 * 5. Focus must survive every operation: after indent/outdent/move the
 *    same bullet keeps focus AND the caret stays at the same offset.
 * 6. Undo/redo covers structural operations (create, delete, indent,
 *    outdent, move, collapse). Text edits do not need to be undoable.
 * 7. Autosave: track which node ids changed ("dirty set"). 1s after the last
 *    edit, send ONE saveChanges batch. Show "Saving…", "Saved", or
 *    "Couldn't save · Retry". Edits made while a save is in flight must not
 *    be lost (they go into the next batch), and only one save may be in
 *    flight at a time. A failed batch is merged back into the dirty set.
 *
 * Stretch:
 * - Enter in the middle of text splits the bullet at the caret.
 * - Clicking a bullet dot "zooms" into it: it becomes the root, with a
 *   breadcrumb trail back to the top.
 * - Handle a CONFLICT by refetching and telling the user.
 *
 * Data structure focus:
 * - Normalized tree: O(1) lookup by id, parent pointers for outdent.
 * - Flattening a tree into visible order (DFS with pruning).
 * - Undo/redo: two stacks. Decide between storing full snapshots and
 *   storing inverse operations, and be ready to defend the choice.
 * - A dirty set for batched saves.
 *
 * Discussion questions:
 * - What's the complexity of indent/outdent in your model vs. the nested one?
 * - How would you render a 50,000-bullet outline smoothly?
 * - How would you support two people editing the same outline live?
 *
 * Time target: 90 minutes.
 */

import styles from "./Outliner.module.css";
import { fetchOutline, saveChanges } from "./mockApi";

export const Outliner = () => {
  // TODO: implement
  void [fetchOutline, saveChanges];

  return <div>Outliner</div>;
};
