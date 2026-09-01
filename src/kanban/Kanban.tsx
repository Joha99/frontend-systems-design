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

import { useEffect, useState, type DragEvent } from "react";
import styles from "./Kanban.module.css";

interface Task {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

type TaskMap = Record<Task["id"], Task>;

type ColumnId = "todo" | "inProgress" | "done";

export const Kanban = () => {
  const [todoCol, setTodoCol] = useState<TaskMap>({});
  const [inProgressCol, setInProgressCol] = useState<TaskMap>({});
  const [doneCol, setDoneCol] = useState<TaskMap>({});

  const [selected, setSelected] = useState(undefined);

  // TODO: initial fetch of data
  useEffect(() => {
    fetch("https://dummyjson.com/todos?limit=20")
      .then((response) => response.json())
      .then((json) => {
        const todoItems: TaskMap = {};
        const doneItems: TaskMap = {};
        json.todos.forEach((todo: Task) => {
          if (todo.completed) {
            doneItems[todo.id] = todo;
          } else {
            todoItems[todo.id] = todo;
          }
        });
        setTodoCol(todoItems);
        setDoneCol(doneItems);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const onDrop = (
    cardId: Task["id"],
    sourceColumn: ColumnId,
    targetColumn: ColumnId,
  ) => {
    console.log("onDrop", cardId, sourceColumn, targetColumn);
    if (sourceColumn === targetColumn) {
      return;
    }

    const setSourceCol =
      sourceColumn === "todo"
        ? setTodoCol
        : sourceColumn === "inProgress"
          ? setInProgressCol
          : setDoneCol;

    const setTargetCol =
      targetColumn === "todo"
        ? setTodoCol
        : targetColumn === "inProgress"
          ? setInProgressCol
          : setDoneCol;

    setSourceCol((prev) => {
      const { [cardId]: removed, ...rest } = prev;
      if (removed) {
        setTargetCol((targetPrev) => ({ ...targetPrev, [cardId]: removed }));
      }
      return rest;
    });
  };

  // TODO: handle drag + drop
  return (
    <div>
      <h2>Kanban</h2>
      <div className={styles.grid}>
        {/* TODO: implement onDragOver for each column*/}
        <div
          id="todo"
          className={styles.column}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();

            const cardId = parseInt(e.dataTransfer.getData("cardId"));
            const sourceColumn = e.dataTransfer.getData(
              "sourceColumn",
            ) as ColumnId;

            onDrop(cardId, sourceColumn, "todo");
          }}
        >
          <h3>Todo</h3>
          <ul className={styles.list}>
            {Object.values(todoCol).map((todo) => {
              // TODO: implement onDragStart for each item
              return (
                <li
                  key={todo.id}
                  id={String(todo.id)}
                  className={styles.item}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("cardId", String(todo.id));
                    e.dataTransfer.setData("sourceColumn", "todo");
                  }}
                >
                  {todo.todo}
                </li>
              );
            })}
          </ul>
        </div>
        <div
          id="inProgress"
          className={styles.column}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();

            const cardId = parseInt(e.dataTransfer.getData("cardId"));
            const sourceColumn = e.dataTransfer.getData(
              "sourceColumn",
            ) as ColumnId;

            onDrop(cardId, sourceColumn, "inProgress");
          }}
        >
          <h3>In Progress</h3>
          <ul className={styles.list}>
            {Object.values(inProgressCol).map((inProgress) => {
              return (
                <li
                  key={inProgress.id}
                  id={String(inProgress.id)}
                  className={styles.item}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("cardId", String(inProgress.id));
                    e.dataTransfer.setData("sourceColumn", "inProgress");
                  }}
                >
                  {inProgress.todo}
                </li>
              );
            })}
          </ul>
        </div>
        <div
          id="done"
          className={styles.column}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();

            const cardId = parseInt(e.dataTransfer.getData("cardId"));
            const sourceColumn = e.dataTransfer.getData(
              "sourceColumn",
            ) as ColumnId;

            onDrop(cardId, sourceColumn, "done");
          }}
        >
          <h3>Done</h3>
          <ul className={styles.list}>
            {Object.values(doneCol).map((done) => {
              return (
                <li
                  key={done.id}
                  id={String(done.id)}
                  className={styles.item}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("cardId", String(done.id));
                    e.dataTransfer.setData("sourceColumn", "done");
                  }}
                >
                  {done.todo}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
