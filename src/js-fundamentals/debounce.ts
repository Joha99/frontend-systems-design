/**
 * Debounce (~10 min). Plain TypeScript, no libraries.
 *
 * debounce(fn, delayMs) returns a new function. Calling it schedules `fn` to
 * run `delayMs` after the most recent call.
 *
 * 1. A burst of calls runs `fn` once, with the arguments from the last call.
 * 2. Calls separated by more than `delayMs` each run `fn`.
 * 3. `fn` runs with the same `this` as the last call.
 * 4. `.cancel()` drops the pending call, and later calls still work.
 *
 * Be ready to say: what does the closure hold, and why?
 *
 * To test: npm run test:fundamentals
 */

export type Debounced<Args extends unknown[]> = {
  (...args: Args): void;
  cancel(): void;
};

export function debounce<Args extends unknown[]>(
  _fn: (...args: Args) => void,
  _delayMs: number,
): Debounced<Args> {
  throw new Error("Not implemented");
}
