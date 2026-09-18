/**
 * Peak Element Finder (Tesla-style)
 *
 * A peak element is greater than or equal to its neighbors.
 *
 * Requirements:
 * 1. Generate a random array of 15-20 numbers (range 1-100).
 * 2. Visualize the array as a bar chart.
 * 3. "Find Peak (Linear)" button finds a peak using linear scan.
 * 4. "Find Peak (Binary Search)" button finds a peak using binary search.
 * 5. Step-by-step animation: each comparison is a visible step
 *    with a delay, highlighting which elements are being checked.
 * 6. Show the step count for each approach side by side.
 * 7. "New Array" button generates a fresh random array.
 *
 * Time target: 20 minutes.
 */

import styles from "./PeakFinder.module.css";

const SAMPLE_ARRAY = [
  12, 35, 7, 54, 23, 78, 42, 91, 16, 63, 5, 88, 30, 47, 9, 72,
];

const linearPeak = (array: number[]) => {
  if (array.length <= 1) {
    return array.length === 1 ? 0 : -1;
  }

  for (let i = 0; i < array.length; i++) {
    if (i === 0 && array[i] >= array[i + 1]) {
      return i;
    }
    if (i === array.length - 1 && array[i] >= array[i - 1]) {
      return i;
    }
    if (array[i] >= array[i - 1] && array[i] >= array[i + 1]) {
      return i;
    }
  }

  return -1;
};

const binarySearchPeak = (array: number[]) => {
  let low = 0;
  let high = array.length - 1;

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);

    if (array[mid] >= array[mid + 1]) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
};

export const PeakFinder = () => {
  const linearPeakIndex = linearPeak(SAMPLE_ARRAY);
  const binaryPeakIndex = binarySearchPeak(SAMPLE_ARRAY);

  return (
    <div style={{ width: "100%" }}>
      <h2>Peak Element Finder</h2>
      <p>Linear peak: {SAMPLE_ARRAY[linearPeakIndex]} (index {linearPeakIndex})</p>
      <p>Binary peak: {SAMPLE_ARRAY[binaryPeakIndex]} (index {binaryPeakIndex})</p>
      <div className={styles.bars}>
        {SAMPLE_ARRAY.map((num, index) => {
          return (
            <div
              key={index}
              className={styles.bar}
              style={{ blockSize: `${num}%` }}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
