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

import { useEffect, useState } from "react";
import "./ThrottledResize.css";

const COOL_DOWN_PERIOD = 1000;

export const ThrottledResize = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerHeight);

  const [numStateUpdates, setNumStateUpdates] = useState<number>(0);
  const [numRawResizeEventsFired, setNumRawResizeEventsFired] =
    useState<number>(0);

  useEffect(() => {
    let timeoutId: number;

    const onWindowResize = () => {
      setNumRawResizeEventsFired((prev) => prev + 1);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        setNumStateUpdates((prev) => prev + 1);
      }, COOL_DOWN_PERIOD);
    };

    window.addEventListener("resize", onWindowResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div>
      <h2>Throttled Resize</h2>
      <div className="label">
        <span>
          Window size: {width} by {height}
        </span>
        {width !== undefined && height !== undefined && (
          <div
            style={{
              aspectRatio: `${width} / ${height}`,
              width: "300px",
              backgroundColor: "yellow",
            }}
          >
            visual box
          </div>
        )}
      </div>
      <div className="label">Number of resizes: {numRawResizeEventsFired}</div>
      <div className="label">Number of state updates: {numStateUpdates}</div>
    </div>
  );
};
