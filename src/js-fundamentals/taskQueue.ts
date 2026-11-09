/**
 * Task queue (~20 min). Plain TypeScript, no libraries.
 * The class version of promisePool, asked in a real interview.
 *
 * const queue = new TaskQueue(2);
 * const { key, promise } = queue.enqueue(() => fetch("/a"));
 * const result = await promise;
 *
 * Tasks arrive one at a time, whenever the caller wants, so there is no array.
 *
 * 1. Never more than `limit` tasks are running.
 * 2. enqueue(run) starts `run` right away if there is room. Otherwise it waits.
 * 3. Waiting tasks start in the order they were enqueued.
 * 4. When a task finishes, the next waiting task starts right away.
 * 5. enqueue returns { key, promise }:
 *    - key: a unique string the queue makes up for this task.
 *    - promise: settles with that task's own result or error.
 * 6. A failed task doesn't stop the queue:
 *    - Its own promise rejects with its error.
 *    - Waiting tasks never start. Their promises reject with that same error.
 *    - Tasks already running finish normally.
 *    - Tasks enqueued after the failure never start, and reject the same way.
 * 7. Tasks enqueued after the queue has gone idle still run.
 *
 * Be ready to say: what does the returned promise wait for, and who settles it?
 *
 * To test: npm run test:fundamentals
 */

let nextId = 0;

export class TaskQueue {
  #limit: number;
  #processing: Record<number, Promise<any>> = {};
  #queue: {
    uuid: number;
    run: () => Promise<any>;
    resolve: any;
    reject: any;
  }[] = [];
  #error: any;

  constructor(limit: number) {
    this.#limit = limit;
  }

  processRun<T>(
    uuid: number,
    run: () => Promise<T>,
    resolve?: any,
    reject?: any,
  ) {
    this.#processing[uuid] = run()
      .then((res) => {
        delete this.#processing[uuid];

        // Process next in queue
        if (this.#queue.length > 0) {
          const next = this.#queue.shift();
          if (next) {
            this.processRun(next.uuid, next.run, next.resolve, next.reject);
          }
        }

        if (resolve) {
          resolve(res);
        } else {
          return res;
        }
      })
      .catch((err) => {
        this.#error = err;

        for (const waiting of this.#queue) {
          waiting.reject(err);
        }

        this.#queue = [];

        if (reject) {
          reject(err);
        } else {
          throw err;
        }
      });
  }

  enqueue<T>(run: () => Promise<T>): { key: string; promise: Promise<T> } {
    const processingCount = Object.entries(this.#processing).length;
    const uuid = nextId++;

    if (this.#error) {
      return {
        key: String(uuid),
        promise: Promise.reject(this.#error),
      };
    }

    if (processingCount >= this.#limit) {
      const promise: Promise<T> = new Promise((resolve, reject) => {
        // resolve and reject are the only way that this promise is settled
        // caller's await promise will wait until either resolve or reject are called
        this.#queue.push({ uuid, run, resolve, reject });
      });

      return {
        key: String(uuid),
        promise,
      };
    }

    this.processRun(uuid, run);

    return {
      key: String(uuid),
      promise: this.#processing[uuid],
    };
  }
}
