/**
 * Mini Figma (Part 4 of 4): Undo / Redo
 *
 * Start from your Part 3 code.
 *
 * Requirements:
 * 1. Cmd/Ctrl+Z undoes, Cmd/Ctrl+Shift+Z redoes. Toolbar buttons too,
 *    disabled when there's nothing to undo/redo.
 * 2. Everything is undoable: create, move, delete, rename, property edits,
 *    reorder, duplicate.
 * 3. One user action = one undo step:
 *    - A whole drag (mouse down → up) is ONE step, not one per mousemove.
 *    - Typing "250" in the X field is ONE step, not three.
 * 4. A new action after an undo clears the redo stack.
 * 5. Undo restores the selection to the affected shape. Undoing a delete
 *    brings the shape back at its old layer position.
 * 6. Route every change through one function (e.g. apply(op)) instead of
 *    calling setState from each handler.
 *
 * Done when: draw 3 shapes, move one, recolor one, delete one, then undo 5
 * times back to the 3 original shapes, and redo all the way forward.
 *
 * Discussion: store inverse operations or whole-state snapshots? What
 * changes if a second user edits the same file (only undo YOUR changes)?
 *
 * Time target: 45 minutes.
 */

export const Part4UndoRedo = () => {
  // TODO: implement
  return (
    <div>
      <h2>Mini Figma: Part 4</h2>
    </div>
  );
};
