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
 *    same color in any direction (horizontal, vertical, diagonal-up, diagonal-down).
 *    Highlight the winning four cells.
 * 4. Detect a draw (board full, no winner).
 * 5. "New Game" button resets the board.
 * 6. Drop animation: the disc should visually fall from the top of the
 *    column to its resting row (CSS transition or keyframe).
 *
 * Algorithm focus:
 * - Win detection: check all 4 directions from the last placed disc.
 *   For each direction, count consecutive same-color discs in both
 *   directions along the axis. If any axis has count >= 4, that player wins.
 *   Directions to check: (0,1) horizontal, (1,0) vertical,
 *   (1,1) diagonal-down-right, (1,-1) diagonal-down-left.
 *   For each, check (dr,dc) and (-dr,-dc) from the placed cell.
 * - Gravity: find the lowest empty row in a column (iterate from bottom).
 *
 * Time target: 30 minutes.
 */

import styles from "./ConnectFour.module.css";

export const ConnectFour = () => {
  // TODO: implement

  return <div>Connect Four</div>;
};
