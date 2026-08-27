/**
 * Dynamic Grid Board (from Retell AI prep guide)
 *
 * Build a dynamic "board" component (similar to a Tic-Tac-Toe or Sudoku grid)
 * that accepts a custom, independent number of rows and columns.
 *
 * Requirements:
 * 1. Accept rows and columns as props (or via input controls).
 * 2. Render a grid of cells using the given dimensions.
 * 3. Focus is on rendering logic — looping/mapping to generate the grid structure.
 * 4. Each cell should be visually distinct (bordered).
 *
 * Stretch:
 * - Click a cell to toggle its state (e.g. highlight or mark with X/O).
 * - Display row and column indices in each cell.
 * - Add inputs to dynamically change the number of rows and columns.
 */

import { useState } from "react";
import styles from "./GridBoard.module.css";

interface GridBoardProps {
  rowCount: number;
  colCount: number;
}

export const GridBoard = ({ rowCount, colCount }: GridBoardProps) => {
  return (
    <div>
      <p>6. Grid Board</p>
      <h1>Approach 1</h1>
      {Array.from({ length: rowCount }, (_, index) => index + 1).map((row) => {
        return (
          <div style={{ display: "flex" }} key={row}>
            {Array.from({ length: colCount }, (_, index) => index + 1).map(
              (col) => (
                <div
                  key={col}
                  style={{
                    height: "50px",
                    width: "50px",
                    border: "1px solid black",
                  }}
                />
              ),
            )}
          </div>
        );
      })}

      <h1>Approach 2</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${colCount}, 50px)`,
          gridAutoRows: "50px",
        }}
      >
        {Array.from(
          { length: rowCount * colCount },
          (_, index) => index + 1,
        ).map((item) => {
          return (
            <div key={item} style={{ border: "1px solid black" }}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
