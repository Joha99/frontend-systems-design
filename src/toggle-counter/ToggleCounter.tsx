/**
 * Toggle Counter
 *
 * Requirements:
 * 1. Display a count starting at 0.
 * 2. Increment and decrement buttons.
 * 3. A "double mode" toggle — when on, increment/decrement by 2 instead of 1.
 * 4. Count should never go below 0.
 *
 * Time target: 5 minutes.
 */

import { useState } from "react";

export const ToggleCounter = () => {
  const [count, setCount] = useState(0);
  const [doubleModeOn, setDoubleModeOn] = useState(false);

  const step = doubleModeOn ? 2 : 1;

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((prev) => prev + step)}>
        Increment
      </button>
      <button
        disabled={count === 0}
        onClick={() => setCount((prev) => Math.max(0, prev - step))}
      >
        Decrement
      </button>
      <div>
        <label htmlFor="doubleMode">Double mode</label>
        <input
          id="doubleMode"
          type="checkbox"
          onChange={() => setDoubleModeOn((prev) => !prev)}
        />
      </div>
    </div>
  );
};
