/**
 * Connect Four
 *
 * Build a two-player Connect Four game on a 6-row x 7-column grid.
 *
 * Requirements:
 * 1. Render a 6x7 grid. Clicking a column drops a disc into the lowest
 *    available row in that column. Columns that are full are unclickable.
 * 2. Alternate turns between Red and Yellow. Show whose turn it is.
 * 3. After each move, check for a winner: four consecutive discs of the
 *    same color in any direction. Highlight the winning cells.
 * 4. Detect a draw (board full, no winner).
 * 5. "New Game" button resets the board.
 *
 * Time target: 30 minutes.
 */

import { useState } from "react";
import styles from "./ConnectFour.module.css";

type Player = "X" | "O" | null;
type Grid = Player[][];

const ROW_COUNT = 6;
const COLUMN_COUNT = 7;
const CONNECT_COUNT = 4;

const defaultGrid: Grid = Array.from({ length: ROW_COUNT }, (_, row_i) => {
  return Array.from({ length: COLUMN_COUNT }, (_, col_i) => {
    return null;
  });
});

export const ConnectFour = () => {
  const [grid, setGrid] = useState<Grid>(defaultGrid);
  const [player, setPlayer] = useState<Player>("X");
  const [winningCells, setWinningCells] = useState<[number, number][]>();

  const detectWin = (row: number, column: number, updatedGrid: Grid) => {
    const offsets: [number, number][] = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [x, y] of offsets) {
      let startX = row - 3 * x;
      let startY = column - 3 * y;

      while (
        startX >= 0 &&
        startX <= row &&
        startX + 3 * x <= ROW_COUNT - 1 &&
        startY >= 0 &&
        startY <= COLUMN_COUNT - 1 &&
        startY + 3 * y >= 0 &&
        startY + 3 * y <= COLUMN_COUNT - 1
      ) {
        const coordinates: [number, number][] = [];
        const players: Player[] = [];

        // from current starting x & y coordinate, create a window of 4 cells
        for (let i = 0; i < 4; i++) {
          const currentX = startX + x * i;
          const currentY = startY + y * i;

          coordinates.push([currentX, currentY]);
          players.push(updatedGrid[currentX][currentY]);
        }

        // if current window is a win, exit out of this function
        if (players.every((p) => p === player)) {
          setWinningCells(coordinates);
          return true;
        }

        // if current windiw is not a win, look at the next window of 4 cells
        startX = startX + x;
        startY = startY + y;
      }
    }
    return false;
  };

  const onCellClick = (column: number) => {
    const nextRowToFill = Array.from(
      { length: 6 },
      (_, i) => grid[i][column],
    ).lastIndexOf(null);

    const updatedGrid = [...grid.map((column) => [...column])];
    updatedGrid[nextRowToFill][column] = player;

    const hasWon = detectWin(nextRowToFill, column, updatedGrid);

    if (!hasWon) {
      setPlayer((prev) => (prev === "X" ? "O" : "X"));
    }
    setGrid(updatedGrid);
  };

  return (
    <div>
      {winningCells ? (
        <p>Player {player} has won!</p>
      ) : (
        <p>Player {player} is up!</p>
      )}
      <div className={styles.grid}>
        {grid.map((row, row_i) => {
          return row.map((col, col_i) => {
            const columnIsNotFull = Array.from(
              { length: 6 },
              (_, i) => grid[i][col_i],
            ).includes(null);

            const isAWinningCell =
              winningCells &&
              winningCells.some(
                (cell) => cell[0] === row_i && cell[1] === col_i,
              );

            return (
              <button
                key={`${row_i}x${col_i}`}
                className={`${styles.cell} ${col === "X" ? styles.x : col === "O" ? styles.o : ""} ${isAWinningCell ? styles.win : ""}`}
                onClick={() => onCellClick(col_i)}
                disabled={!columnIsNotFull}
              >
                {grid[row_i][col_i] ?? ""}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
};
