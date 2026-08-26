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

import { useEffect, useState } from "react";

import styles from "./CrudList.module.css";

const API_BASE_URL = "https://dummyjson.com/todos";

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

type FetchStatus = "loading" | "success" | "error";
type TodoAction = "toggle" | "delete";
type TodoMap = Record<Todo["id"], Todo>;
type ActionStatusMap = Record<
  Todo["id"],
  { action: TodoAction; status: FetchStatus }
>;

export const CrudList = () => {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | undefined>(
    undefined,
  );
  const [todoMap, setTodoMap] = useState<TodoMap>({});
  const [newTodo, setNewTodo] = useState("");
  const [actionStatus, setActionStatus] = useState<ActionStatusMap>({});

  useEffect(() => {
    setFetchStatus("loading");
    fetch(`${API_BASE_URL}?limit=10`)
      .then((response) => response.json())
      .then((json) => {
        const todos: Todo[] = json.todos;
        const newTodoMap: TodoMap = {};
        for (const todo of todos) {
          newTodoMap[todo.id] = todo;
        }
        setFetchStatus("success");
        setTodoMap(newTodoMap);
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  const onTodoToggle = (id: Todo["id"]) => {
    const currentTodoItem = todoMap[id];
    setActionStatus((prev) => ({
      ...prev,
      [id]: { action: "toggle", status: "loading" },
    }));
    fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentTodoItem.completed }),
    })
      .then((response) => response.json())
      .then((updatedTodo) => {
        setTodoMap((prev) => ({ ...prev, [id]: updatedTodo }));
        setActionStatus((prev) => ({
          ...prev,
          [id]: { action: "toggle", status: "success" },
        }));
      })
      .catch(() => {
        setActionStatus((prev) => ({
          ...prev,
          [id]: { action: "toggle", status: "error" },
        }));
      });
  };

  const onTodoDelete = (id: Todo["id"]) => {
    setActionStatus((prev) => ({
      ...prev,
      [id]: { action: "delete", status: "loading" },
    }));
    fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        setTodoMap((prev) => {
          const newTodoMap: TodoMap = { ...prev };
          delete newTodoMap[id];
          return newTodoMap;
        });
        setActionStatus((prev) => ({
          ...prev,
          [id]: { action: "delete", status: "success" },
        }));
      })
      .catch(() => {
        setActionStatus((prev) => ({
          ...prev,
          [id]: { action: "delete", status: "error" },
        }));
      });
  };

  const onTodoAdd = () => {
    if (!newTodo.trim()) return;

    fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: newTodo, completed: false, userId: 1 }),
    })
      .then((response) => response.json())
      .then((createdTodo) => {
        setTodoMap((prev) => ({ ...prev, [createdTodo.id]: createdTodo }));
        setNewTodo("");
      })
      .catch(() => {});
  };

  const todoList = Object.values(todoMap);

  return (
    <div>
      <p>4. Build a CRUD todo list with full API integration.</p>
      {fetchStatus === "success" ? (
        <>
          {todoList.length > 0 ? (
            <ul className={styles.list}>
              {todoList.map(({ id, todo, completed }) => (
                <li key={id} className={styles["list-item"]}>
                  <input
                    type="checkbox"
                    checked={completed}
                    disabled={actionStatus[id]?.status === "loading"}
                    onChange={() => onTodoToggle(id)}
                  />
                  <span>{todo}</span>
                  <button
                    className={styles.delete}
                    disabled={actionStatus[id]?.status === "loading"}
                    onClick={() => onTodoDelete(id)}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles["empty-state"]}>No todos yet.</p>
          )}
          <div className={styles["add-todo-controls"]}>
            <input
              type="text"
              placeholder="New todo item description"
              value={newTodo}
              onChange={(event) => setNewTodo(event.currentTarget.value)}
            />
            <button disabled={!newTodo.trim()} onClick={onTodoAdd}>
              +
            </button>
          </div>
        </>
      ) : (
        <p>
          {fetchStatus === "loading"
            ? "Loading..."
            : "There was an issue fetching your todo list."}
        </p>
      )}
    </div>
  );
};
