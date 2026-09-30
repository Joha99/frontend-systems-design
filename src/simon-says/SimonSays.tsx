/**
 * Simon Says
 *
 * Build Simon: repeat a growing sequence of colors.
 *
 * Requirements:
 * 1. Four colored pads. Start adds one random pad to the sequence.
 * 2. Playback: flash each pad in the sequence in order (e.g. 500ms lit,
 *    150ms gap). The player can't press pads during playback.
 * 3. The player repeats the sequence by clicking pads, or with keys 1–4.
 *    Each press flashes the pad briefly.
 * 4. Correct full sequence → after a short pause, add one step and play
 *    it back again. Wrong press → game over, show the score (sequence length
 *    reached).
 * 5. Playback speeds up every 5 rounds.
 * 6. Restart during playback must cancel it immediately: no pad from the
 *    old game may flash after Restart. Unmounting must also cancel it.
 * 7. Show the current round and the best score (kept in localStorage).
 *
 * Done when: pressing Restart halfway through a long playback starts a
 * clean new game with no stray flashes.
 *
 * Think about:
 * - How do you cancel a sequence of timeouts (or an async loop with
 *   awaits)? What does each approach need to keep track of?
 * - Which values do your timer callbacks read, and could they be stale?
 *
 * Stretch:
 * - Play a tone per pad (Web Audio API).
 * - Strict mode toggle vs. "replay the sequence once after a mistake".
 *
 * Time target: 35 minutes.
 */

import styles from "./SimonSays.module.css";

export const SimonSays = () => {
  // TODO: implement

  return <div>Simon Says</div>;
};
