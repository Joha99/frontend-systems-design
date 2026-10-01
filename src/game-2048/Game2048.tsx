/**
 * 2048
 *
 * Build the 2048 sliding-tile game.
 *
 * Requirements:
 * 1. A 4x4 board. Start with two tiles (each a 2, or a 4 with 10% chance)
 *    in random empty cells.
 * 2. Arrow keys slide ALL tiles in that direction:
 *    - Tiles move as far as they can.
 *    - Two equal tiles that collide merge into one with double the value,
 *      and the score increases by the merged value.
 *    - A tile created by a merge can't merge again in the same move.
 *    Examples, sliding LEFT:
 *      [2, 2, 2, 2] → [4, 4, 0, 0]
 *      [2, 2, 4, 0] → [4, 4, 0, 0]
 *      [4, 0, 4, 4] → [8, 4, 0, 0]
 * 3. Write the slide for ONE row in ONE direction, then reuse it for all
 *    four directions (by reversing and/or transposing the board) instead of
 *    writing four versions.
 * 4. After a move that changed the board, spawn one new tile in a random
 *    empty cell. A move that changes nothing spawns nothing.
 * 5. Update the board immutably.
 * 6. Win when a 2048 tile appears (let the player keep going). Game over
 *    when no move can change the board.
 * 7. Show the score and a New Game button.
 *
 * Done when: the three example rows slide correctly, and pressing an arrow
 * that can't move anything doesn't add a tile.
 *
 * Stretch:
 * - Undo the last move (reuse your Pixel Editor history pattern).
 * - Best score in localStorage.
 * - Slide/merge animations.
 *
 * Time target: 45 minutes.
 */

import styles from "./Game2048.module.css";

export const Game2048 = () => {
  // TODO: implement

  return (
    <div>
      <h2>2048</h2>
    </div>
  );
};
