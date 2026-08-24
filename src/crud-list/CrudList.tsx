/**
 * CRUD Todo List
 *
 * Build a todo list that supports full Create, Read, Update, and Delete operations via an API.
 * API base: https://dummyjson.com/todos
 *
 * Endpoints:
 * - GET    /todos?limit=10            → { todos: [{ id, todo, completed, userId }, ...] }
 * - POST   /todos/add                 → body: { todo, completed, userId } → returns created todo with id
 * - PUT    /todos/{id}                → body: { todo?, completed? } → returns updated todo
 * - DELETE /todos/{id}                → returns deleted todo with isDeleted: true
 *
 * Requirements:
 * 1. On mount, fetch and display a list of todos (text + completed status).
 * 2. Add a text input and button to create a new todo (POST). Add it to the list on success.
 * 3. Each todo has a checkbox to toggle completed status (PUT).
 * 4. Each todo has a delete button to remove it (DELETE). Remove it from the list on success.
 * 5. Show loading, error, and empty states for the initial fetch.
 * 6. Show inline loading/error feedback for create, update, and delete operations.
 *
 * Stretch:
 * - Inline editing — click a todo's text to edit it, press Enter or blur to save (PUT).
 * - Optimistic updates — update the UI immediately, roll back on error.
 */

import styles from "./CrudList.module.css";

export const CrudList = () => {
  return (
    <div>
      <p>4. Build a CRUD todo list with full API integration.</p>
    </div>
  );
};
