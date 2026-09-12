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

import styles from "./TicTacToe.module.css";

export const TicTacToe = () => {
  // TODO: implement

  return <div>Tic-Tac-Toe</div>;
};
