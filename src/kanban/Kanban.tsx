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
 * 3. On drop, update local state to move the card to the new column.
 * 4. Show loading state during initial fetch.
 * 5. Show the count of cards in each column header.
 * 6. Clicking a card selects it (highlighted border). Clicking outside any card deselects it.
 *    Use useRef + document event listener for outside click detection.
 *
 * Implementation notes:
 * - Use the HTML Drag and Drop API (no libraries).
 * - Use onDragStart, onDragOver, onDrop events.
 * - Use dataTransfer to pass the dragged card's id and source column.
 */

import styles from "./Kanban.module.css";

export const Kanban = () => {
  return <div>Kanban</div>;
};
