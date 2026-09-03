/**
 * Drag-and-Drop Kanban Board
 *
 * Build a kanban board where tasks can be moved between columns.
 * API: GET https://dummyjson.com/todos?limit=20
 * Response: { todos: [{ id, todo, completed, userId }, ...] }
 *
 * Columns: "To Do", "In Progress", "Done"
 * Map initial data: completed=true -> "Done", all others -> "To Do"
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
 *
 * Time target: 20 minutes.
 */

import { useEffect, useState } from "react";
import "./Kanban.css";

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

type ColumnMap = Record<Todo["id"], Todo>;

type ColumnName = "todo" | "in-progress" | "done";

export const Kanban = () => {
  const [todoColumn, setTodoColumn] = useState<ColumnMap>({});
  const [progressColumn, setProgressColumn] = useState<ColumnMap>({});
  const [doneColumn, setDoneColumn] = useState<ColumnMap>({});
  const [selected, setSelected] = useState<Todo["id"] | null>(null);
  const [initialFetchStatus, setInitialFetchStatus] = useState<
    "loading" | "success" | "error"
  >();

  useEffect(() => {
    setInitialFetchStatus("loading");
    fetch("https://dummyjson.com/todos?limit=20")
      .then((res) => res.json())
      .then((data: { todos: Todo[] }) => {
        setInitialFetchStatus("success");

        const computedTodoColumn: ColumnMap = {};
        const computedDoneColumn: ColumnMap = {};

        data.todos.forEach((todo) => {
          if (todo.completed) {
            computedDoneColumn[todo.id] = todo;
          } else {
            computedTodoColumn[todo.id] = todo;
          }
        });

        setTodoColumn(computedTodoColumn);
        setDoneColumn(computedDoneColumn);
      })
      .catch(() => {
        setInitialFetchStatus("error");
      });
  }, []);

  if (initialFetchStatus === "loading") {
    return <p>Loading your todo items...</p>;
  }

  if (initialFetchStatus === "error") {
    return <p>There was an error loading your todo items.</p>;
  }

  return (
    <div className="grid">
      <div className="column">
        <h2>TODO</h2>
        {Object.values(todoColumn).map(({ id, todo, completed }) => {
          return (
            <div key={id} className="item">
              <div
                className="indicator"
                style={{
                  backgroundColor: "#fd734c",
                }}
              />
              {todo}
            </div>
          );
        })}
      </div>
      <div className="column">
        <h2>IN PROGRESS</h2>
        {Object.values(progressColumn).map(({ id, todo, completed }) => {
          return (
            <div key={id} className="item">
              <div
                className="indicator"
                style={{
                  backgroundColor: "#edf86c",
                }}
              />
              {todo}
            </div>
          );
        })}
      </div>
      <div className="column">
        <h2>DONE</h2>
        {Object.values(doneColumn).map(({ id, todo, completed }) => {
          return (
            <div key={id} className="item">
              <div
                className="indicator"
                style={{
                  backgroundColor: "#44c148",
                }}
              />
              {todo}
            </div>
          );
        })}
      </div>
    </div>
  );
};
