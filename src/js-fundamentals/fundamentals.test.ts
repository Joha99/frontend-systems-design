import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { debounce } from "./debounce.ts";
import { promisePool } from "./promisePool.ts";

describe("debounce", () => {
  it("runs once after a burst, with the last arguments", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 100);

    run("a");
    t.mock.timers.tick(50);
    run("b");
    t.mock.timers.tick(99);
    assert.deepEqual(calls, []);

    t.mock.timers.tick(1);
    assert.deepEqual(calls, ["b"]);
  });

  it("runs again for calls separated by more than the delay", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 100);

    run("a");
    t.mock.timers.tick(100);
    run("b");
    t.mock.timers.tick(100);
    assert.deepEqual(calls, ["a", "b"]);
  });

  it("keeps `this` from the call", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const seen: unknown[] = [];
    const counter = {
      save: debounce(function (this: unknown) {
        seen.push(this);
      }, 100),
    };

    counter.save();
    t.mock.timers.tick(100);
    assert.equal(seen[0], counter);
  });

  it("cancel drops the pending call, and later calls still work", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 100);

    run("a");
    run.cancel();
    t.mock.timers.tick(100);
    assert.deepEqual(calls, []);

    run("b");
    t.mock.timers.tick(100);
    assert.deepEqual(calls, ["b"]);
  });
});

/** A task you finish by hand, so each test controls the order. */
const deferredTask = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  let started = false;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    run: () => {
      started = true;
      return promise;
    },
    resolve,
    reject,
    get started() {
      return started;
    },
  };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("promisePool", () => {
  it("resolves [] for no tasks", async () => {
    assert.deepEqual(await promisePool([], 2), []);
  });

  it("keeps input order, not finish order", async () => {
    const a = deferredTask<string>();
    const b = deferredTask<string>();
    const pool = promisePool([a.run, b.run], 2);

    b.resolve("b");
    await flush();
    a.resolve("a");
    assert.deepEqual(await pool, ["a", "b"]);
  });

  it("starts only `limit` tasks, then the next as soon as one finishes", async () => {
    const a = deferredTask<number>();
    const b = deferredTask<number>();
    const c = deferredTask<number>();
    const pool = promisePool([a.run, b.run, c.run], 2);

    await flush();
    assert.deepEqual([a.started, b.started, c.started], [true, true, false]);

    b.resolve(2);
    await flush();
    assert.equal(c.started, true, "c should start while a is still running");

    a.resolve(1);
    c.resolve(3);
    assert.deepEqual(await pool, [1, 2, 3]);
  });

  it("handles a limit larger than the task count", async () => {
    const results = await promisePool([async () => 1, async () => 2], 10);
    assert.deepEqual(results, [1, 2]);
  });

  it("rejects with the first error and starts no more tasks", async () => {
    const a = deferredTask<number>();
    const b = deferredTask<number>();
    const c = deferredTask<number>();
    const pool = promisePool([a.run, b.run, c.run], 2);

    a.reject(new Error("boom"));
    await assert.rejects(pool, /boom/);

    b.resolve(2);
    await flush();
    assert.equal(c.started, false);
  });
});
