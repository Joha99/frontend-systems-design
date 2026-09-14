/**
 * Tic-Tac-Toe
 *
 * Build a two-player Tic-Tac-Toe game on a 3x3 grid.
 *
 * Requirements:
 * 1. Render a 3x3 grid. Clicking an empty cell places the current
 *    player's mark (X or O). Filled cells are unclickable.
 * 2. Alternate turns between X and O. Show whose turn it is.
 * 3. After each move, check for a winner: three in a row horizontally,
 *    vertically, or diagonally. Highlight the winning cells.
 * 4. Detect a draw (all cells filled, no winner).
 * 5. "New Game" button resets the board.
 * 6. Score tracker: wins for X, wins for O, draws. Persists across
 *    new games (resets on page refresh is fine).
 *
 * Algorithm focus:
 * - Win detection: check all 8 possible lines (3 rows, 3 columns,
 *   2 diagonals). A line wins if all 3 cells have the same non-empty value.
 *   Store winning lines as arrays of [row, col] tuples.
 * - Board as 2D array: board[row][col] = 'X' | 'O' | null.
 *
 * Time target: 15 minutes.
 */

import { useState } from "react";
import styles from "./TicTacToe.module.css";

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[][];
type WinningCells = [[number, number], [number, number], [number, number]];

const defaultBoard: Board = Array.from({ length: 3 }, (_) => {
  return Array.from({ length: 3 }, (_) => {
    return null;
  });
});

export const TicTacToe = () => {
  const [player, setPlayer] = useState<Player>("X");
  const [board, setBoard] = useState<Board>(defaultBoard);
  const [winningCells, setWinningCells] = useState<WinningCells>();

  const winner = winningCells
    ? board[winningCells[0][0]][winningCells[0][1]]
    : undefined;

  const isDraw: boolean =
    !board.some((row) => {
      return row.includes(null);
    }) && !winner;

  const checkForWin = (
    row: number,
    column: number,
    newBoard: Board,
  ): { hasWin: boolean; winningCells?: WinningCells } => {
    const linesToCheck: Array<WinningCells> = [
      [
        [row, 0],
        [row, 1],
        [row, 2],
      ],
      [
        [0, column],
        [1, column],
        [2, column],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    let currWinningCells: WinningCells | undefined;

    const hasWin = linesToCheck.some((line) => {
      // every coordinate in the line must be the current player
      const lineHasWin = line.every(([row_i, col_i]) => {
        return newBoard[row_i][col_i] === player;
      });

      if (lineHasWin) {
        currWinningCells = [...line];
      }

      return lineHasWin;
    });

    return {
      hasWin,
      winningCells: currWinningCells,
    };
  };

  const onCellClick = (row: number, column: number) => {
    const newBoard = [...board.map((row) => [...row])];
    newBoard[row][column] = player;
    const { hasWin, winningCells } = checkForWin(row, column, newBoard);

    if (!hasWin) {
      setPlayer(player === "X" ? "O" : "X");
    } else {
      setWinningCells(winningCells);
    }

    setBoard(newBoard);
  };

  return (
    <div>
      {isDraw ? (
        <p>Game ended with a draw!</p>
      ) : winner ? (
        <p>Player {winner} has won! </p>
      ) : (
        <p>Player {player} is up!</p>
      )}

      <div className={styles.board}>
        {board.map((row, row_i) => {
          return row.map((col, col_i) => {
            const currentCell = col ?? "";
            const isInWinningCell =
              winningCells &&
              winningCells.some(
                (coordinate) =>
                  coordinate[0] === row_i && coordinate[1] === col_i,
              );

            return (
              <button
                key={`${row_i}x${col_i}`}
                className={`${styles.cell} ${isInWinningCell ? styles.winningCell : ""}`}
                onClick={() => onCellClick(row_i, col_i)}
                disabled={col !== null || winner !== undefined || isDraw}
              >
                {currentCell}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
};
