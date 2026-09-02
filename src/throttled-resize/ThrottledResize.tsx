/**
 * Throttled Window Resize Tracker
 *
 * Build a component that displays the current window dimensions,
 * updating at most once every 200ms as the user resizes.
 *
 * Requirements:
 * 1. Display the current window width and height.
 * 2. Listen to the window "resize" event inside a useEffect.
 * 3. Throttle updates so state changes at most once every 200ms.
 *    Throttle differs from debounce: debounce waits until activity stops,
 *    throttle allows one update per interval while activity continues.
 * 4. Show a counter of how many raw resize events fired vs how many state updates happened.
 * 5. Clean up the event listener on unmount.
 * 6. Display a visual box whose width/height matches the window aspect ratio (scaled down).
 *
 * Hints:
 * - Throttle pattern: track a "lastRan" timestamp. On each event, if enough time
 *   has passed since lastRan, update state and reset lastRan. Otherwise, schedule
 *   a trailing update with setTimeout.
 * - Use useRef for the lastRan timestamp and timeout id (they shouldn't trigger re-renders).
 *
 * Time target: 12 minutes.
 */

import styles from "./ThrottledResize.module.css";

export const ThrottledResize = () => {
  return <div>Throttled Resize</div>;
};
