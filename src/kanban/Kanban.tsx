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
 * Time target: 20 minutes.
 */

import {
  useEffect,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import "./Kanban.css";

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

type ColumnMap = Record<number, Todo>;

type ColumnName = "todo" | "in-progress" | "done";

interface ColumnConfig {
  header: string;
  items: Todo[];
  indicatorColor: CSSProperties["backgroundColor"];
  setter: Dispatch<SetStateAction<ColumnMap>>;
}

export const Kanban = () => {
  const [fetchStatus, setFetchStatus] = useState<
    "loading" | "success" | "error"
  >();
  const [todoColumn, setTodoColumn] = useState<ColumnMap>({});
  const [progressColumn, setProgressColumn] = useState<ColumnMap>({});
  const [doneColumn, setDoneColumn] = useState<ColumnMap>({});

  useEffect(() => {
    setFetchStatus("loading");
    fetch("https://dummyjson.com/todos?limit=20")
      .then((res) => res.json())
      .then((data: { todos: Todo[] }) => {
        const todoItems: ColumnMap = {};
        const doneItems: ColumnMap = {};

        data.todos.forEach((todo) => {
          if (todo.completed) {
            doneItems[todo.id] = todo;
          } else {
            todoItems[todo.id] = todo;
          }
        });

        setFetchStatus("success");
        setTodoColumn(todoItems);
        setDoneColumn(doneItems);
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  if (fetchStatus === "loading") {
    return <p>Loading your todo items...</p>;
  }

  if (fetchStatus === "error") {
    return <p>There was an error loading your todo items.</p>;
  }

  const columns: Record<ColumnName, ColumnConfig> = {
    todo: {
      header: "Todo",
      items: Object.values(todoColumn),
      indicatorColor: "#fd734c",
      setter: setTodoColumn,
    },
    "in-progress": {
      header: "In Progress",
      items: Object.values(progressColumn),
      indicatorColor: "#edf86c",
      setter: setProgressColumn,
    },
    done: {
      header: "Done",
      items: Object.values(doneColumn),
      indicatorColor: "#44c148",
      setter: setDoneColumn,
    },
  };

  return (
    <div className="grid">
      {Object.entries(columns).map(([columnId, column]) => (
        <div
          key={columnId}
          className="column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const sourceId = e.dataTransfer.getData("columnId") as ColumnName;
            const itemId = parseInt(e.dataTransfer.getData("itemId"));

            if (sourceId === columnId) return;

            const droppedItem = columns[sourceId].items.find(
              (item) => item.id === itemId,
            )!;

            columns[sourceId].setter((prev) => {
              const { [itemId]: _, ...rest } = prev;
              return rest;
            });

            column.setter((prev) => ({
              ...prev,
              [itemId]: droppedItem,
            }));
          }}
        >
          <h2>{column.header}</h2>
          {column.items.map(({ id, todo }) => (
            <div
              key={id}
              className="item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("columnId", columnId);
                e.dataTransfer.setData("itemId", String(id));
              }}
            >
              <div
                className="indicator"
                style={{ backgroundColor: column.indicatorColor }}
              />
              {todo}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
