/**
 * Whack-a-Mole
 *
 * Build Whack-a-Mole with a countdown timer.
 *
 * Requirements:
 * 1. A 3x3 grid of holes. Start begins a 30-second game with a countdown.
 * 2. Every 800ms a mole appears in a random hole (never the same hole twice
 *    in a row) and stays up for 700ms unless whacked.
 * 3. Clicking a mole that's up scores +1 and hides it immediately.
 *    Clicking an empty hole does nothing.
 * 4. Keyboard: keys 1–9 whack the matching hole (1 = top-left, like a
 *    phone keypad or numpad layout, your choice; document it).
 * 5. When time runs out, stop everything, show the final score, and allow
 *    a new game.
 * 6. No leaks: all intervals and timeouts are cleared when the game ends,
 *    when a new game starts, and on unmount.
 *
 * Done when: scores are never lost or double-counted, even when clicking
 * very fast, and nothing keeps running after the game ends.
 *
 * Think about:
 * - Your interval callback updates the score and the mole. Will it see the
 *   latest values? (Same trap as the stale-closure quiz questions.)
 * - One interval driving everything vs. separate timers per mole: which is
 *   easier to clean up?
 *
 * Stretch:
 * - Difficulty levels (faster moles, shorter up-time).
 * - Several moles up at once.
 * - Pause/resume that also pauses the countdown.
 *
 * Time target: 30 minutes.
 */

import styles from "./WhackAMole.module.css";

export const WhackAMole = () => {
  // TODO: implement

  return <div>Whack-a-Mole</div>;
};
