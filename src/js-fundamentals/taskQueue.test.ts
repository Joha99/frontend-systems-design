import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TaskQueue } from "./taskQueue.ts";

/** A task the test finishes by hand, so it controls the timing. */
const manualTask = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  let started = false;
  const run = () => {
    started = true;
    return promise;
  };
  return { run, resolve, reject, hasStarted: () => started };
};

/** Lets pending promise callbacks run. */
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("TaskQueue", () => {
  it("starts a task right away when there is room", () => {
    const queue = new TaskQueue(2);
    const a = manualTask<string>();
    queue.enqueue(a.run);
    assert.equal(a.hasStarted(), true);
  });

  it("never runs more than the limit", async () => {
    const queue = new TaskQueue(2);
    const tasks = [manualTask<number>(), manualTask<number>(), manualTask<number>()];
    tasks.forEach((task) => queue.enqueue(task.run));
    await flush();

    assert.deepEqual(
      tasks.map((task) => task.hasStarted()),
      [true, true, false],
    );
  });

  it("starts the next task as soon as one finishes", async () => {
    const queue = new TaskQueue(1);
    const a = manualTask<string>();
    const b = manualTask<string>();
    queue.enqueue(a.run);
    queue.enqueue(b.run);

    a.resolve("a");
    await flush();
    assert.equal(b.hasStarted(), true);
  });

  it("starts waiting tasks in the order they were enqueued", async () => {
    const queue = new TaskQueue(1);
    const a = manualTask<string>();
    const b = manualTask<string>();
    const c = manualTask<string>();
    [a, b, c].forEach((task) => queue.enqueue(task.run));

    a.resolve("a");
    await flush();
    assert.equal(b.hasStarted(), true);
    assert.equal(c.hasStarted(), false);
  });

  it("resolves each enqueue with its own task's result", async () => {
    const queue = new TaskQueue(1);
    const first = queue.enqueue(async () => "first");
    const second = queue.enqueue(async () => 2);

    assert.equal(await first, "first");
    assert.equal(await second, 2);
  });

  it("rejects only the task that failed, and keeps going", async () => {
    const queue = new TaskQueue(1);
    const failing = queue.enqueue(async () => {
      throw new Error("boom");
    });
    const next = queue.enqueue(async () => "still ran");

    await assert.rejects(failing, /boom/);
    assert.equal(await next, "still ran");
  });

  it("frees the slot when a task fails", async () => {
    const queue = new TaskQueue(1);
    const a = manualTask<string>();
    const b = manualTask<string>();
    const failing = queue.enqueue(a.run);
    queue.enqueue(b.run);

    a.reject(new Error("boom"));
    await assert.rejects(failing, /boom/);
    await flush();
    assert.equal(b.hasStarted(), true);
  });

  it("runs tasks enqueued after the queue has gone idle", async () => {
    const queue = new TaskQueue(1);
    assert.equal(await queue.enqueue(async () => "a"), "a");
    await flush();
    assert.equal(await queue.enqueue(async () => "b"), "b");
  });
});
