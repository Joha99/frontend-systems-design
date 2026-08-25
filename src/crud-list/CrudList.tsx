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
  todo: "string";
  completed: boolean;
  userId: number;
}

type TodoMap = Record<Todo["id"], Todo>;

type FetchStatus = "loading" | "success" | "error";

export const CrudList = () => {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | undefined>(
    undefined,
  );
  const [todoMap, setTodoMap] = useState<TodoMap>({});
  const [newTodo, setNewTodo] = useState<string>("");

  // Fetch items once on mount
  useEffect(() => {
    console.log("Fetching todo list");
    setFetchStatus("loading");

    fetch(`${API_BASE_URL}?limit=10`)
      .then((response) => response.json())
      .then((json) => {
        const todos: Todo[] = json.todos;
        const newTodoMap: TodoMap = {};

        for (const todo of todos) {
          newTodoMap[todo.id] = todo;
        }

        console.log("Successfully fetched todo list", todos);
        setFetchStatus("success");
        setTodoMap(newTodoMap);
      })
      .catch((error) => {
        console.error("Error with fetching todo list", error);
        setFetchStatus("error");
      });
  }, []);

  const onTodoToggle = (id: Todo["id"]) => {
    const currentTodoItem = todoMap[id];

    fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentTodoItem.completed }),
    })
      .then((response) => response.json())
      .then((newTodoObject) => {
        setTodoMap({ ...todoMap, [id]: newTodoObject });
      })
      .catch((error) => {
        console.error("onTodoToggle error", error);
      });
  };

  const onTodoDelete = (id: Todo["id"]) => {
    fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((deletedTodoObject) => {
        const newTodoMap: TodoMap = { ...todoMap };
        delete newTodoMap[deletedTodoObject[id]];
        setTodoMap(newTodoMap);
      })
      .catch((error) => {
        console.error("onTodoDelete error", error);
      });
  };

  const onTodoAdd = () => {
    console.log("onTodoAdd newTodo", newTodo);

    const newTodoObject = {
      todo: newTodo,
      completed: false,
      userId: Object.values(todoMap)[0].userId,
    };

    fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodoObject),
    })
      .then((response) => response.json())
      .then((newTodoObject) => {
        const newTodoMap = { ...todoMap, [newTodoObject.id]: newTodoObject };
        setTodoMap(newTodoMap);
        setNewTodo("");
      })
      .catch((error) => {
        console.error("onTodoAdd error", error);
      });
  };

  const todoList = Object.values(todoMap);

  // TODO: while item is being updated/deleted, disable the checkbox & delete button
  return (
    <div>
      <p>4. Build a CRUD todo list with full API integration.</p>
      {/* Status message for initial fetch & user actions */}
      {fetchStatus === "success" ? (
        <>
          {/* List of todos */}
          <ul className={styles.list}>
            {todoList.map(({ id, todo, completed }) => {
              return (
                <li key={id} className={styles["list-item"]}>
                  {/* onChange, toggle the completed state */}
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => {
                      onTodoToggle(id);
                    }}
                  />
                  <span>{todo}</span>
                  {/* onClick, remove the item */}
                  <button
                    className={styles.delete}
                    onClick={() => {
                      onTodoDelete(id);
                    }}
                  >
                    x
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Inputs for adding new todo items */}
          <div className={styles["add-todo-controls"]}>
            <input
              type="text"
              placeholder="New todo item description"
              onChange={(event) => {
                setNewTodo(event.currentTarget.value);
              }}
            />
            <button
              onClick={() => {
                onTodoAdd();
              }}
            >
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
