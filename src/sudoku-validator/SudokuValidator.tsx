/**
 * Sudoku Board with Validation
 *
 * Build an interactive Sudoku board that validates input in real time.
 *
 * Requirements:
 * 1. Render a 9x9 Sudoku grid with thicker borders for the 3x3 boxes.
 *    Pre-fill some cells from a puzzle (read-only). Empty cells are editable.
 * 2. Clicking an empty cell selects it. Typing 1-9 fills it.
 *    Backspace/Delete clears it.
 * 3. Real-time validation: highlight conflicting cells (same number in
 *    the same row, column, or 3x3 box).
 * 4. Win condition: all cells filled with no conflicts.
 */

import { useState, type ChangeEvent } from "react";
import styles from "./SudokuValidator.module.css";
import { PUZZLE, type Board } from "./data";

type Coord = [number, number];

export const SudokuValidator = () => {
  const [board, setBoard] = useState<Board>(PUZZLE);
  const [conflicting, setConflicting] = useState<Coord[]>([]);

  const checkCellsForConflict = (
    coordinates: Coord[],
    board: Board,
  ): Coord[] => {
    const conflicts: Coord[] = [];
    const seen: Record<number, Coord[]> = {};

    for (const [r, c] of coordinates) {
      const cellValue = board[r][c];
      if (cellValue === null) continue;
      if (!seen[cellValue]) seen[cellValue] = [];
      seen[cellValue].push([r, c]);
    }

    for (const coords of Object.values(seen)) {
      if (coords.length > 1) {
        conflicts.push(...coords);
      }
    }

    return conflicts;
  };

  const checkBoardForConflicts = (newBoard: Board) => {
    let conflicts: Coord[] = [];

    for (let i = 0; i < 9; i++) {
      const rowToCheck: [number, number][] = Array.from(
        { length: 9 },
        (_, c) => [i, c],
      );

      const columnToCheck: [number, number][] = Array.from(
        { length: 9 },
        (_, r) => [r, i],
      );

      conflicts.push(
        ...checkCellsForConflict(rowToCheck, newBoard),
        ...checkCellsForConflict(columnToCheck, newBoard),
      );
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const topLeftR = r * 3;
        const topLeftC = c * 3;
        const cellsToCheck: Coord[] = [];

        for (let i = topLeftR; i < topLeftR + 3; i++) {
          for (let j = topLeftC; j < topLeftC + 3; j++) {
            cellsToCheck.push([i, j]);
          }
        }

        conflicts.push(...checkCellsForConflict(cellsToCheck, newBoard));
      }
    }

    return conflicts;
  };

  const onCellChange = (
    e: ChangeEvent<HTMLInputElement>,
    row: number,
    column: number,
  ) => {
    const newValue = e.currentTarget.value;
    const newBoard: Board = [...board.map((row) => [...row])];
    newBoard[row][column] = newValue === "" ? null : parseInt(newValue);
    setBoard(newBoard);

    const boardConflicts = checkBoardForConflicts(newBoard);
    setConflicting(boardConflicts);
  };

  const isBoardComplete = board.every((row) =>
    row.every((cell) => cell !== null),
  );
  const sudokuIsComplete = isBoardComplete && conflicting.length === 0;

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>Sudoku Validator</h2>
      <div
        className={styles.grid}
        style={{ borderColor: sudokuIsComplete ? "#23e21c" : undefined }}
      >
        {board.map((row, r) => {
          return row.map((cell, c) => {
            const isBottomBolded = r === 2 || r === 5;
            const isRightBolded = c === 2 || c === 5;
            const isAConflict = conflicting.some(
              (cell) => cell[0] === r && cell[1] === c,
            );

            return (
              <input
                key={`${r}x${c}`}
                className={`${styles.cell} ${isRightBolded ? styles.boldedCol : ""} ${isBottomBolded ? styles.boldedRow : ""} ${isAConflict ? styles.conflict : ""}`}
                value={cell !== null ? cell : ""}
                onChange={(e) => onCellChange(e, r, c)}
              />
            );
          });
        })}
      </div>
    </div>
  );
};
