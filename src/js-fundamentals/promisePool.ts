/**
 * Promise pool (~15 min). Plain TypeScript, no libraries.
 *
 * promisePool(tasks, limit) runs async tasks with at most `limit` running at
 * the same time, and resolves with all their results.
 *
 * 1. Results are in the same order as `tasks`, not the order they finish.
 * 2. Never more than `limit` tasks are running.
 * 3. When a task finishes, the next one starts right away, not in batches.
 * 4. An empty `tasks` array resolves to [].
 * 5. If a task rejects, the pool rejects with that error and starts no more
 *    tasks. Tasks already running are left to finish.
 *
 * Be ready to say: why is `tasks` an array of functions, not promises?
 *
 * To test: npm run test:fundamentals
 */

export function promisePool<T>(
  _tasks: (() => Promise<T>)[],
  _limit: number,
): Promise<T[]> {
  throw new Error("Not implemented");
}
