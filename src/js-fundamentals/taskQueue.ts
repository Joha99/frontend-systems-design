/**
 * Task queue (~20 min). Plain TypeScript, no libraries.
 * The class version of promisePool, asked in a real interview.
 *
 * const queue = new TaskQueue(2);
 * const result = await queue.enqueue(() => fetch("/a"));
 *
 * Tasks arrive one at a time, whenever the caller wants, so there is no array.
 *
 * 1. Never more than `limit` tasks are running.
 * 2. enqueue(run) starts `run` right away if there is room. Otherwise it waits.
 * 3. Waiting tasks start in the order they were enqueued.
 * 4. When a task finishes, the next waiting task starts right away.
 * 5. enqueue returns a promise that settles with that task's own result or
 *    error.
 * 6. A failed task doesn't stop the others.
 * 7. Tasks enqueued after the queue has gone idle still run.
 *
 * Be ready to say: what does enqueue's promise wait for, and who settles it?
 *
 * To test: npm run test:fundamentals
 */

export class TaskQueue {
  constructor(_limit: number) {
    // TODO
  }

  enqueue<T>(_run: () => Promise<T>): Promise<T> {
    throw new Error("Not implemented");
  }
}
