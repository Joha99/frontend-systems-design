/**
 * Memory Card Game
 *
 * Build a card matching game where the player flips pairs of cards
 * to find matches.
 *
 * Requirements:
 * 1. Render a 4x4 grid of face-down cards (16 cards = 8 pairs).
 *    Each pair has a matching emoji or symbol.
 * 2. Clicking a face-down card flips it face-up (shows its symbol).
 *    The player can flip at most 2 cards at a time.
 * 3. If the two flipped cards match: keep them face-up (mark as matched).
 *    If they don't match: flip both back face-down after a 1-second delay.
 * 4. During the 1-second delay, additional clicks are ignored.
 * 5. Move counter: increment after each pair attempt (not each click).
 * 6. Win condition: all pairs matched. Show "You won in X moves!"
 * 7. "New Game" button: shuffle and reset.
 *
 * Algorithm focus:
 * - Shuffle: Fisher-Yates shuffle to randomize card positions.
 *   Create array of pairs [A,A,B,B,C,C,...], shuffle it.
 * - State tracking: each card has { id, symbol, isFlipped, isMatched }.
 *   "flipped" = temporarily shown, "matched" = permanently shown.
 * - Comparison: when 2 cards are flipped, compare their symbols.
 *
 * Time target: 20 minutes.
 */

import styles from "./MemoryGame.module.css";

export const MemoryGame = () => {
  // TODO: implement

  return <div>Memory Game</div>;
};
