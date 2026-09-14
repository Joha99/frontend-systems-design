/**
 * Peak Element Finder
 *
 * Tesla asks array manipulation questions. A classic one: find a peak
 * element in an array (an element greater than or equal to its neighbors).
 *
 * Requirements:
 * 1. Generate a random array of 15-20 numbers (range 1-100).
 * 2. Visualize the array as a bar chart.
 * 3. "Find Peak (Linear)" button — walks left to right, highlights
 *    each element as it checks, stops at the first peak. O(n).
 * 4. "Find Peak (Binary Search)" button — uses binary search to find
 *    a peak. Highlight lo, hi, mid on each step. O(log n).
 * 5. Step-by-step animation: each comparison is a visible step
 *    (use setTimeout or requestAnimationFrame with a delay).
 * 6. Show the step count for each approach side by side.
 * 7. "New Array" button generates a fresh random array.
 *
 * Algorithm focus:
 * - Linear scan: if arr[i] >= arr[i-1] && arr[i] >= arr[i+1], it's a peak.
 * - Binary search: compare mid with mid+1. If arr[mid] < arr[mid+1],
 *   peak is in the right half; otherwise left half. O(log n).
 * - Edge elements: arr[0] is a peak if arr[0] >= arr[1].
 *
 * Time target: 20 minutes.
 */

import styles from "./PeakFinder.module.css";

export const PeakFinder = () => {
  return <div>Peak Element Finder</div>;
};
