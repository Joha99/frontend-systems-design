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
 *
 * 2. Store the grid IMMUTABLY as an array of rows. Painting a cell creates
 *    a new row array for THAT row and a new outer array; every other row
 *    stays the SAME array as before.
 *
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

export const PixelEditor = () => {
  const [paletteColor, setPaletteColor] = useState<Color>();

  const [grid, setGrid] = useState<Grid>(defaultGrid);
  const [undoStack, setUndoStack] = useState<Grid[]>([]);
  const [redoStack, setRedoStack] = useState<Grid[]>([]);

  const onPaletteColorClick = (color: Color) => {
    if (color === paletteColor) {
      setPaletteColor(undefined);
    } else {
      setPaletteColor(color);
    }
  };

  const onCellClick = (row: number, column: number) => {
    if (!paletteColor) return;
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[row][column] = paletteColor;
      return newGrid;
    });
  };

  return (
    <div>
      <h2>Pixel Editor</h2>
      <div>
        <h3>Palette</h3>
        {paletteColor && <h4>Selected: {paletteColor}</h4>}
        <ul className={styles.list}>
          {PALETTE.map((color) => {
            return (
              <li key={color}>
                <button
                  className={styles.palette}
                  style={{ "--color": color } as CSSProperties}
                  onClick={() => onPaletteColorClick(color)}
                >
                  {color}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.grid}>
        {grid.map((row, r) => {
          return row.map((cellColor, c) => {
            return (
              <button
                key={`${r}x${c}`}
                className={styles.cell}
                style={{ "--color": cellColor } as CSSProperties}
                disabled={!paletteColor}
                onClick={() => onCellClick(r, c)}
              >
                {cellColor}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
};
