/**
 * Sliding Window Practice (3 levels)
 *
 * Level 1: 1D Max Sum
 * Given an array of numbers and window size k=4, find the maximum
 * sum of any k consecutive elements. Display the array as a row
 * of boxes. Highlight the current window as it slides. Show the
 * sum of each window and highlight the max.
 *
 * Level 2: 1D Consecutive Match
 * Given a row of colored cells (e.g., "R","R","Y","R","R","R","R","Y"),
 * find if there are 4 consecutive cells of the same color.
 * Highlight the winning window if found.
 *
 * Level 3: 2D Row/Column Search
 * Given a 6x7 grid of colored cells, check a single given cell's
 * row and column for 4 consecutive same-color cells. This is
 * Connect Four's win detection but limited to 2 directions
 * (horizontal + vertical only, no diagonals).
 *
 * Each level has a "Step" button that advances the window by one
 * position, and a "Run All" button that animates through all
 * positions.
 *
 * Time target: 10 minutes per level.
 */

import styles from "./SlidingWindowPractice.module.css";

const MAX_SUM_ARRAY = [2, 5, 1, 8, 3, 7, 4, 6];
const MAX_SUM_WINDOW_SIZE = 4;
const CONSECUTIVE_MATCH_ARRAY = ["R", "R", "Y", "R", "R", "R", "R", "Y"];

type Cell = "R" | "Y" | null;

// Test cell: (5, 4) — horizontal win: row 5, cols 3-6 (R R R R)
// Test cell: (2, 1) — vertical win: col 1, rows 1-4 (Y Y Y Y)
// Test cell: (1, 4) — diagonal ↘ win: (0,3),(1,4),(2,5),(3,6) (R R R R)
// Test cell: (2, 4) — diagonal ↙ win: (1,5),(2,4),(3,3),(4,2) (Y Y Y Y)
const LEVEL_3_GRID: Cell[][] = [
  [null, null, null, "R", null, null, null],
  [null, "Y", null, null, "R", "Y", null],
  [null, "Y", null, null, "Y", "R", null],
  [null, "Y", null, "Y", null, null, "R"],
  [null, "Y", "Y", null, null, null, null],
  [null, null, null, "R", "R", "R", "R"],
];

const LEVEL_3_TEST_CELLS: [number, number][] = [
  [5, 4], // horizontal (R: row 5, cols 3-6)
  [2, 1], // vertical (Y: col 1, rows 1-4)
  [1, 4], // diagonal ↘ (R: 0,3 -> 1,4 -> 2,5 -> 3,6)
  [2, 4], // diagonal ↙ (Y: 1,5 -> 2,4 -> 3,3 -> 4,2)
];

const findMaxSum = (array: number[], k: number) => {
  let start = 0;
  let max = 0;
  let currentSum = 0;

  let window: number[] = [];
  let sumOfWindows: Record<number, number> = {};

  while (start <= array.length - 1) {
    if (start < k - 1) {
      currentSum += array[start];
    } else if (start === k - 1) {
      currentSum += array[start];
      sumOfWindows[start] = currentSum;
      max = currentSum;
      window = [start - k + 1, start];
    } else {
      currentSum = currentSum - array[start - k] + array[start];
      sumOfWindows[start] = currentSum;

      if (currentSum > max) {
        max = currentSum;
        window = [start - k + 1, start];
      }
    }

    start++;
  }

  return {
    window,
    sumOfWindows,
  };
};

const findConsecutiveCells = (array: string[]) => {
  let start = 0;
  let consecutiveWindow: number[] = [];

  while (start <= array.length - 4) {
    // look at window of 4 elements starting from start
    const currValue = array[start];
    let isConsecutive = true;

    for (let i = 1; i <= 3; i++) {
      if (array[start + i] !== currValue) {
        isConsecutive = false;
        break;
      }
    }

    // if they are the same, return
    if (isConsecutive) {
      consecutiveWindow = [start, start + 3];
      break;
    }

    start++;
  }

  return {
    consecutiveWindow,
  };
};

const getConsecutive = (
  row: number,
  column: number,
  dx: number,
  dy: number,
): {
  count: number;
  window: [number, number][];
} => {
  const valueAtOrigin = LEVEL_3_GRID[row][column];
  let currR = row + dx;
  let currC = column + dy;
  let count = 0;
  let window: [number, number][] = [];

  while (
    currR >= 0 &&
    currR <= LEVEL_3_GRID.length - 1 &&
    currC >= 0 &&
    currC <= LEVEL_3_GRID[0].length - 1 &&
    LEVEL_3_GRID[currR][currC] === valueAtOrigin
  ) {
    window.push([currR, currC]);
    count++;
    currR += dx;
    currC += dy;
  }

  return { count, window };
};

const findConnectFour = (row: number, column: number): [number, number][] => {
  const offsets: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (const offset of offsets) {
    const dx = offset[0];
    const dy = offset[1];

    const windowInPositiveDirection = getConsecutive(row, column, dx, dy);
    const windowInNegativeDirection = getConsecutive(
      row,
      column,
      -1 * dx,
      -1 * dy,
    );
    const consecutiveAmount =
      1 + windowInPositiveDirection.count + windowInNegativeDirection.count;

    if (consecutiveAmount >= 4) {
      return [
        ...windowInNegativeDirection.window,
        [row, column],
        ...windowInPositiveDirection.window,
      ];
    }
  }

  return [];
};

export const SlidingWindowPractice = () => {
  const { window, sumOfWindows } = findMaxSum(
    MAX_SUM_ARRAY,
    MAX_SUM_WINDOW_SIZE,
  );

  const { consecutiveWindow } = findConsecutiveCells(CONSECUTIVE_MATCH_ARRAY);

  const connectFourWindow = findConnectFour(2, 5);

  return (
    <div>
      <h2>level 1</h2>
      <div style={{ display: "flex" }}>
        {MAX_SUM_ARRAY.map((value, i) => {
          const isInWindow = i >= window[0] && i <= window[1];
          const windowSum = sumOfWindows[i] ?? 0;

          return (
            <div
              key={`${value}:${i}`}
              className={`${styles.block} ${isInWindow ? styles.window : ""}`}
            >
              <span>value: {value}</span>
              <span>window sum: {windowSum}</span>
            </div>
          );
        })}
      </div>

      {/* Find if there are 4 consecutive cells of same value */}
      <h2>level 2</h2>
      <div style={{ display: "flex" }}>
        {CONSECUTIVE_MATCH_ARRAY.map((value, i) => {
          const isInWindow =
            i >= consecutiveWindow[0] && i <= consecutiveWindow[1];
          return (
            <div
              key={`${value}:${i}`}
              className={`${styles.block} ${isInWindow ? styles.window : ""}`}
            >
              {value}
            </div>
          );
        })}
      </div>

      {/* connect 4 detection */}
      <h2>level 3</h2>
      <div className={styles.board}>
        {LEVEL_3_GRID.map((row, r) => {
          return row.map((col, c) => {
            const cell = col ?? "";
            const isInWindow = connectFourWindow.some(
              (coord) => coord[0] === r && coord[1] === c,
            );

            return (
              <div
                key={`${r}:${c}`}
                className={`${styles.block} ${isInWindow ? styles.window : ""}`}
              >
                {cell}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
