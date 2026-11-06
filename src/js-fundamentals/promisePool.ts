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

export async function promisePool<T>(
  _tasks: (() => Promise<T>)[],
  _limit: number,
): Promise<T[]> {
  const res: T[] = new Array(_tasks.length);
  // is updated every time a worker starts a process
  let processingTaskIndex = 0;
  let failed = false;

  const worker = async () => {
    // while loop ensures that when one task finishes, that task processes the next item
    while (!failed && processingTaskIndex < _tasks.length) {
      const currIndex = processingTaskIndex;

      processingTaskIndex++;

      try {
        const resolved = await _tasks[currIndex]();
        res[currIndex] = resolved;
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  };

  const workers = Array.from({ length: Math.min(_limit, _tasks.length) }, () =>
    worker(),
  );

  // waits for all workers to deplete the queue
  await Promise.all(workers);
  return res;
}
