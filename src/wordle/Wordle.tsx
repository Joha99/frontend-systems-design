/**
 * Wordle
 *
 * Build Wordle: guess a 5-letter word in 6 tries.
 *
 * Data: ./words.ts exports ANSWERS (possible answers) and WORDS (all valid
 * guesses, including every answer).
 *
 * Requirements:
 * 1. Pick a random answer. Render a 6x5 grid of letter tiles.
 * 2. Typing: listen for physical keyboard input on the document.
 *    Letters fill the current row, Backspace deletes, Enter submits.
 *    Ignore input once the game is over.
 * 3. Enter on a row that isn't 5 letters, or isn't in WORDS, doesn't submit.
 *    Show a message ("Not in word list") and shake the row.
 * 4. Scoring a guess. This is the core algorithm. Each letter is:
 *    - green: right letter, right spot
 *    - yellow: in the word, wrong spot
 *    - gray: not in the word, OR all copies of it are already used up
 *    Duplicate letters are the tricky part. Example:
 *      answer LEVER, guess EERIE → yellow, green, yellow, gray, gray
 *    (Only ONE E is left after the green E, so the last E is gray.)
 * 5. An on-screen keyboard that also works by clicking. Each key shows the
 *    BEST status that letter has had so far (green beats yellow beats gray).
 * 6. Win when a row is all green; lose after 6 wrong guesses and reveal
 *    the answer. A Play Again button starts a new game.
 *
 * Done when: the LEVER / EERIE example scores correctly, and the on-screen
 * keyboard never downgrades a green key to yellow.
 *
 * Stretch:
 * - Flip animation revealing tiles one at a time.
 * - Hard mode: revealed hints must be used in later guesses.
 * - Stats (games played, win %, streak) in localStorage.
 *
 * Time target: 45 minutes.
 */

import styles from "./Wordle.module.css";
import { WORDS, ANSWERS } from "./words";

export const Wordle = () => {
  // TODO: implement
  void [WORDS, ANSWERS];

  return (
    <div>
      <h2>Wordle</h2>
    </div>
  );
};
