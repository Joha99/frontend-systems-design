/**
 * Pixel Editor with Undo / Redo
 *
 * Build a tiny pixel-art editor with multi-level undo and redo.
 * No API: everything is local state. The focus is the history model.
 *
 * Requirements:
 * 1. Render a 16x16 grid of cells (all white to start) and a palette of
 *    5 colors. Clicking a cell paints it with the selected color.
 *    A "Clear" button resets every cell to white.
 * 2. Store the grid IMMUTABLY as an array of rows. Painting a cell creates
 *    a new row array for THAT row and a new outer array; every other row
 *    stays the SAME array as before.
 * 3. Undo/redo with two stacks:
 *    - Before each action (paint, clear), save the current grid onto the
 *      undo stack.
 *    - Undo restores the previous grid; Redo re-applies what was undone.
 *    - A NEW action after an undo clears the redo stack.
 *
 * 4. Undo/Redo buttons, disabled when there's nothing to undo/redo, plus
 *    Cmd/Ctrl+Z = undo and Cmd/Ctrl+Shift+Z = redo.
 *
 * Done when: paint a few cells, clear, undo twice, redo once. The grid is
 * correct at every step, and painting after an undo disables Redo.
 *
 * Things to be ready to explain:
 * - Why is saving a full snapshot per action cheap here?
 * - Why must redo be cleared after a new action?
 *
 * Time target: 25 minutes.
 */

import { useState, type CSSProperties } from "react";
import styles from "./PixelEditor.module.css";

const GRID_SIZE = 16;
const PALETTE = [
  "#1f2937",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
] as const;
const EMPTY = "#ffffff";
const defaultGrid: Grid = Array.from({ length: 16 }, () =>
  Array(16).fill(EMPTY),
);

type Color = (typeof PALETTE)[number];
type Grid = Color[][];
type Action = "redo" | "undo" | "paint";

export const PixelEditor = () => {
  const [paletteColor, setPaletteColor] = useState<Color>();
  const [lastAction, setLastAction] = useState<Action>();

  // holds current state of grid
  const [grid, setGrid] = useState<Grid>(defaultGrid.map((row) => [...row]));

  // holds old snapshots
  const [undoStack, setUndoStack] = useState<Grid[]>([]);

  // holds currently made changes that were undone
  // each redo entry is a snapshot of a future that came after the state you undid back to from the undo stack
  const [redoStack, setRedoStack] = useState<Grid[]>([]);

  const onPaletteClick = (color: Color) => {
    if (color === paletteColor) {
      setPaletteColor(undefined);
    } else {
      setPaletteColor(color);
    }
  };

  const onPaint = (row: number, column: number) => {
    if (!paletteColor) return;

    if (lastAction !== "paint") {
      setRedoStack([]);
    }

    setLastAction("paint");
    setUndoStack((prev) => [...prev, grid]);
    setGrid((prev) => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][column] = paletteColor;
      return newGrid;
    });
  };

  const onReset = () => {
    setUndoStack((prev) => [...prev, grid]);
    setPaletteColor(undefined);
    setGrid(defaultGrid.map((row) => [...row]));
  };

  const onUndo = () => {
    // store current state of grid onto the redoStack
    // pop the last grid off undoStack and set current grid to the popped grid
    setLastAction("undo");

    setRedoStack((prev) => {
      const newRedo = [...prev, grid];
      return newRedo;
    });

    const lastUndo = undoStack[undoStack.length - 1];
    setGrid(lastUndo);

    setUndoStack((prev) => {
      const newUndo = [...prev];
      newUndo.pop();
      return newUndo;
    });
  };

  const onRedo = () => {
    setLastAction("redo");

    setUndoStack((prev) => {
      const newUndo = [...prev, grid];
      return newUndo;
    });

    const lastRedo = redoStack[redoStack.length - 1];
    setGrid(lastRedo);

    setRedoStack((prev) => {
      const newRedo = [...prev];
      newRedo.pop();
      return newRedo;
    });
  };

  return (
    <div className={styles.container}>
      <h2>Pixel Editor</h2>

      <div>
        <h3>Actions</h3>
        <div className={styles.actions}>
          <button onClick={onReset}>Reset</button>
          <button onClick={onUndo} disabled={undoStack.length === 0}>
            Undo
          </button>
          <button onClick={onRedo} disabled={redoStack.length === 0}>
            Redo
          </button>
        </div>
      </div>

      <div>
        <h3>Palette</h3>
        {paletteColor && <p>Selected: {paletteColor}</p>}
        <ul className={styles.list}>
          {PALETTE.map((color) => {
            return (
              <li key={color}>
                <button
                  className={styles.palette}
                  style={{ "--color": color } as CSSProperties}
                  onClick={() => onPaletteClick(color)}
                >
                  {color}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3>Cells</h3>
        <p>Undo stack size: {undoStack.length}</p>
        <p>Redo stack size: {redoStack.length}</p>
        <div className={styles.grid}>
          {grid.map((row, r) => {
            return row.map((cellColor, c) => {
              return (
                <button
                  key={`${r}x${c}`}
                  className={styles.cell}
                  style={{ "--color": cellColor } as CSSProperties}
                  disabled={!paletteColor}
                  onClick={() => onPaint(r, c)}
                >
                  {cellColor}
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};
