/**
 * Reorderable List
 *
 * Build a list of items that can be reordered by dragging using Framer Motion.
 *
 * Requirements:
 * 1. Display a list of 5-6 items.
 * 2. Each item can be dragged up/down to reorder.
 * 3. Other items animate smoothly to make room as an item is dragged.
 * 4. Use Framer Motion's Reorder components.
 * 5. Visual feedback: dragged item has elevation/shadow, slight scale.
 *
 * Hints:
 * - Reorder.Group with axis="y" and onReorder to update state.
 * - Reorder.Item for each draggable item.
 * - whileDrag prop for visual feedback (scale, boxShadow).
 * - layout prop handles the repositioning animation automatically.
 *
 * Time target: 10 minutes.
 */

import "./ReorderableList.css";

export const ReorderableList = () => {
  return <div>Reorderable List</div>;
};
