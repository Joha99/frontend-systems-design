/**
 * Snake Game
 *
 * Build the classic Snake game with keyboard controls and score tracking.
 *
 * Requirements:
 * 1. Render a 20x20 grid. The snake starts as 3 cells in the center,
 *    moving right.
 * 2. Arrow keys change direction. Prevent 180-degree turns (can't go
 *    left if currently going right).
 * 3. Game loop: every 150ms, the snake moves one cell in its direction.
 *    The head moves to the next cell, and the tail is removed (unless
 *    the snake just ate food).
 * 4. Food: one food cell on the grid at a time, placed at a random
 *    empty cell. When the snake's head reaches the food, the snake
 *    grows by 1 (don't remove the tail this tick) and new food appears.
 * 5. Collision detection:
 *    - Wall: head goes out of bounds. Game over.
 *    - Self: head hits any body segment. Game over.
 * 6. Score display: +10 per food eaten. Show high score (persisted in
 *    localStorage).
 * 7. Game over screen with "Play Again" button.
 * 8. Speed increases every 5 foods eaten (decrease interval by 10ms,
 *    minimum 50ms).
 *
 * Algorithm / data structure focus:
 * - Snake as a queue (deque): push new head to front, pop tail from back.
 *   Use an array with unshift/pop, or track head/tail indices.
 * - Collision detection: O(1) with a Set of "row,col" strings for body
 *   positions, instead of O(n) array scan.
 * - Random food placement: pick random empty cell. If grid is mostly full,
 *   collect all empty cells first, then pick randomly from that list.
 * - Direction queue: buffer direction changes so rapid key presses don't
 *   skip frames (e.g. pressing Up then Left before the next tick should
 *   queue both, not lose the second).
 *
 * Time target: 30 minutes.
 */

import styles from "./SnakeGame.module.css";

export const SnakeGame = () => {
  // TODO: implement

  return <div>Snake Game</div>;
};
