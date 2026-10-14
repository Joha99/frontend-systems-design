/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "./eventBus.ts";

type Events = {
  ping: number;
  "thread:archived": { id: string };
  other: string;
};

const quietBus = () => new EventBus<Events>({ onError: () => {} });

describe("Part 1: basics", () => {
  test("on + emit delivers the payload", () => {
    const bus = quietBus();
    const got: number[] = [];
    bus.on("ping", (n) => got.push(n));
    bus.emit("ping", 1);
    bus.emit("ping", 2);
    assert.deepEqual(got, [1, 2]);
  });

  test("listeners run in registration order", () => {
    const bus = quietBus();
    const order: string[] = [];
    bus.on("ping", () => order.push("a"));
    bus.on("ping", () => order.push("b"));
    bus.on("ping", () => order.push("c"));
    bus.emit("ping", 0);
    assert.deepEqual(order, ["a", "b", "c"]);
  });

  test("events are independent", () => {
    const bus = quietBus();
    const got: string[] = [];
    bus.on("other", (s) => got.push(s));
    bus.emit("ping", 1);
    assert.deepEqual(got, []);
  });

  test("emitting with no listeners is fine", () => {
    const bus = quietBus();
    assert.doesNotThrow(() => bus.emit("ping", 1));
  });

  test("the returned function unsubscribes, and is safe to call twice", () => {
    const bus = quietBus();
    let calls = 0;
    const off = bus.on("ping", () => calls++);
    off();
    off();
    bus.emit("ping", 1);
    assert.equal(calls, 0);
    assert.equal(bus.listenerCount("ping"), 0);
  });

  test("off() removes a listener", () => {
    const bus = quietBus();
    let calls = 0;
    const fn = () => calls++;
    bus.on("ping", fn);
    bus.off("ping", fn);
    bus.emit("ping", 1);
    assert.equal(calls, 0);
  });

  test("the same function registered twice is registered once", () => {
    const bus = quietBus();
    let calls = 0;
    const fn = () => calls++;
    bus.on("ping", fn);
    bus.on("ping", fn);
    assert.equal(bus.listenerCount("ping"), 1);
    bus.emit("ping", 1);
    assert.equal(calls, 1);
  });

  test("a throwing listener does not stop the others and is reported", () => {
    const errors: Array<[unknown, string]> = [];
    const bus = new EventBus<Events>({
      onError: (err, event) => errors.push([err, event]),
    });
    const got: string[] = [];
    bus.on("ping", () => got.push("before"));
    bus.on("ping", () => {
      throw new Error("boom");
    });
    bus.on("ping", () => got.push("after"));
    bus.emit("ping", 1);
    assert.deepEqual(got, ["before", "after"]);
    assert.equal(errors.length, 1);
    assert.equal((errors[0][0] as Error).message, "boom");
    assert.equal(errors[0][1], "ping");
  });
});

describe("Part 2: snapshot semantics + once", () => {
  test("a listener added during emit is not called for that emit", () => {
    const bus = quietBus();
    const got: string[] = [];
    bus.on("ping", () => {
      got.push("first");
      bus.on("ping", () => got.push("added"));
    });
    bus.emit("ping", 1);
    assert.deepEqual(got, ["first"]);
    bus.emit("ping", 2);
    assert.deepEqual(got, ["first", "first", "added"]);
  });

  test("a listener removed during emit is still called for that emit", () => {
    const bus = quietBus();
    const got: string[] = [];
    const second = () => got.push("second");
    bus.on("ping", () => {
      got.push("first");
      bus.off("ping", second);
    });
    bus.on("ping", second);
    bus.emit("ping", 1);
    assert.deepEqual(got, ["first", "second"]);
    bus.emit("ping", 2);
    assert.deepEqual(got, ["first", "second", "first"]);
  });

  test("once fires a single time", () => {
    const bus = quietBus();
    let calls = 0;
    bus.once("ping", () => calls++);
    bus.emit("ping", 1);
    bus.emit("ping", 2);
    assert.equal(calls, 1);
    assert.equal(bus.listenerCount("ping"), 0);
  });

  test("once survives a re-entrant emit of the same event", () => {
    const bus = quietBus();
    let calls = 0;
    bus.once("ping", (n) => {
      calls++;
      if (n === 1) bus.emit("ping", 2);
    });
    bus.emit("ping", 1);
    assert.equal(calls, 1);
  });

  test("once can be cancelled before it fires", () => {
    const bus = quietBus();
    let calls = 0;
    const off = bus.once("ping", () => calls++);
    off();
    bus.emit("ping", 1);
    assert.equal(calls, 0);
    assert.equal(bus.listenerCount("ping"), 0);
  });
});

describe("Part 3: waitFor", () => {
  test("resolves with the next payload", async () => {
    const bus = quietBus();
    const p = bus.waitFor("thread:archived");
    bus.emit("thread:archived", { id: "t1" });
    bus.emit("thread:archived", { id: "t2" });
    assert.deepEqual(await p, { id: "t1" });
    assert.equal(bus.listenerCount("thread:archived"), 0);
  });

  test("rejects with AbortError and cleans up when aborted", async () => {
    const bus = quietBus();
    const controller = new AbortController();
    const p = bus.waitFor("ping", { signal: controller.signal });
    assert.equal(bus.listenerCount("ping"), 1);
    controller.abort();
    await assert.rejects(p, (err: Error) => err.name === "AbortError");
    assert.equal(bus.listenerCount("ping"), 0);
  });

  test("an already-aborted signal rejects immediately", async () => {
    const bus = quietBus();
    const p = bus.waitFor("ping", { signal: AbortSignal.abort() });
    await assert.rejects(p, (err: Error) => err.name === "AbortError");
    assert.equal(bus.listenerCount("ping"), 0);
  });
});
