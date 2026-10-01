/**
 * 15 Puzzle
 *
 * Build the classic 15 puzzle: 15 numbered tiles and one gap on a 4x4 board.
 *
 * Requirements:
 * 1. Render tiles 1–15 and one empty cell. Solved = 1..15 in order with
 *    the gap last.
 * 2. Clicking a tile next to the gap slides it into the gap.
 * 3. Arrow keys slide the tile that is on the OPPOSITE side of the gap in
 *    the arrow's direction (ArrowLeft moves the tile to the RIGHT of the
 *    gap into it, like pushing it left).
 * 4. Shuffle: a random layout must be SOLVABLE. Half of all random
 *    arrangements aren't. Either:
 *    - generate a random permutation and check solvability (research the
 *      inversion-count rule for even-width boards), or
 *    - start solved and make a few hundred random valid moves.
 *    Be ready to explain the trade-off between the two.
 * 5. Show a move counter and a timer that starts on the first move.
 * 6. Detect the win, stop the timer, and show the result.
 *
 * Done when: 20 shuffles in a row are all solvable, and the timer stops
 * exactly when the last tile lands.
 *
 * Stretch:
 * - Clicking a tile in the same row/column as the gap slides several
 *   tiles at once.
 * - Board size selector (3x3, 4x4, 5x5): your solvability check must work
 *   for odd AND even widths.
 *
 * Time target: 35 minutes.
 */

import styles from "./SlidingPuzzle.module.css";

export const SlidingPuzzle = () => {
  // TODO: implement

  return (
    <div>
      <h2>15 Puzzle</h2>
    </div>
  );
};
