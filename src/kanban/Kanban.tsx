/**
 * Drag-and-Drop Kanban Board
 *
 * Build a kanban board where tasks can be moved between columns.
 * API: GET https://dummyjson.com/todos?limit=20
 * Response: { todos: [{ id, todo, completed, userId }, ...] }
 *
 * Columns: "To Do", "In Progress", "Done"
 * Map initial data: completed=true → "Done", all others → "To Do"
 *
 * Requirements:
 * 1. On mount, fetch todos and render them as cards in the appropriate columns.
 * 2. Users can drag a card from one column to another.
 * 3. Users can reorder cards within a column via drag.
 * 4. On drop, send a PUT request to update the todo's status.
 * 5. Show loading state during initial fetch.
 * 6. Show the count of cards in each column header.
 *
 * Implementation notes:
 * - Use the HTML Drag and Drop API (no libraries).
 * - Use onDragStart, onDragOver, onDrop, and onDragEnd events.
 * - Use dataTransfer to pass the dragged card's id.
 *
 * Stretch:
 * - Optimistic reorder — move the card immediately, roll back on API error.
 * - Add a "New Task" button to each column that creates a task (POST).
 * - Animate cards entering/leaving columns.
 * - Drop indicator — highlight where the card will land.
 */

import styles from "./Kanban.module.css";

export const Kanban = () => {
  return (
    <div>
      <p>8. Build a drag-and-drop kanban board.</p>
    </div>
  );
};
