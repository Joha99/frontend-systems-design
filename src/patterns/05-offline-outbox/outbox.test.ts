/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { MemoryStorage, Outbox, TransportError, type Transport } from "./outbox.ts";

type Sent = { id: string; type: string; payload: unknown };

/** A transport whose responses the test scripts: each send() pops the next
 *  outcome ("ok", "retry", "fatal", "network"); default "ok". */
class ScriptedTransport implements Transport {
  sent: Sent[] = [];
  script: Array<"ok" | "retry" | "fatal" | "network"> = [];

  async send(m: Sent) {
    this.sent.push(m);
    const outcome = this.script.shift() ?? "ok";
    if (outcome === "retry") throw new TransportError("503", true);
    if (outcome === "fatal") throw new TransportError("400", false);
    if (outcome === "network") throw new TypeError("Failed to fetch");
  }
}

/** A transport where the test resolves each send manually. */
class ManualTransport implements Transport {
  sent: Sent[] = [];
  private resolvers: Array<() => void> = [];

  send(m: Sent) {
    this.sent.push(m);
    return new Promise<void>((resolve) => this.resolvers.push(resolve));
  }

  resolveNext() {
    this.resolvers.shift()?.();
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0));

const setup = (overrides: { transport?: Transport; storage?: MemoryStorage; maxAttempts?: number } = {}) => {
  let time = 1_000_000;
  let n = 0;
  const transport = overrides.transport ?? new ScriptedTransport();
  const storage = overrides.storage ?? new MemoryStorage();
  const outbox = new Outbox({
    transport,
    storage,
    now: () => time,
    generateId: () => `m${++n}`,
    baseDelayMs: 1000,
    maxAttempts: overrides.maxAttempts,
  });
  return {
    outbox,
    transport,
    storage,
    advance: (ms: number) => {
      time += ms;
    },
  };
};

describe("Part 1: queue + delivery", () => {
  test("enqueue returns an id and persists immediately", () => {
    const { outbox, storage } = setup();
    const id = outbox.enqueue("archive", { threadId: "t1" });
    assert.equal(id, "m1");
    assert.deepEqual(outbox.pending.map((m) => [m.id, m.type, m.attempts, m.nextAttemptAt]), [["m1", "archive", 0, 0]]);
    assert.equal(storage.data?.pending.length, 1);
    assert.deepEqual(storage.data?.pending[0].payload, { threadId: "t1" });
  });

  test("restores pending and dead from storage", () => {
    const storage = new MemoryStorage({
      pending: [{ id: "x", type: "archive", payload: 1, attempts: 2, nextAttemptAt: 0 }],
      dead: [{ id: "y", type: "label", payload: 2, attempts: 5, nextAttemptAt: 0 }],
    });
    const { outbox } = setup({ storage });
    assert.deepEqual(outbox.pending.map((m) => m.id), ["x"]);
    assert.deepEqual(outbox.dead.map((m) => m.id), ["y"]);
  });

  test("flush sends in order and removes delivered mutations", async () => {
    const { outbox, transport, storage } = setup();
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.enqueue("b", 2);
    outbox.enqueue("c", 3);
    outbox.setOnline(true);
    await outbox.flush();
    assert.deepEqual((transport as ScriptedTransport).sent, [
      { id: "m1", type: "a", payload: 1 },
      { id: "m2", type: "b", payload: 2 },
      { id: "m3", type: "c", payload: 3 },
    ]);
    assert.equal(outbox.pending.length, 0);
    assert.deepEqual(storage.data?.pending, []);
  });

  test("offline: flush sends nothing; going online flushes automatically", async () => {
    const { outbox, transport } = setup();
    outbox.setOnline(false);
    assert.equal(outbox.online, false);
    outbox.enqueue("a", 1);
    await outbox.flush();
    assert.equal((transport as ScriptedTransport).sent.length, 0);
    outbox.setOnline(true);
    await outbox.flush(); // joins the flush started by setOnline
    assert.equal((transport as ScriptedTransport).sent.length, 1);
    assert.equal(outbox.pending.length, 0);
  });

  test("concurrent flush calls share one flush (no double sends)", async () => {
    const transport = new ManualTransport();
    const { outbox } = setup({ transport });
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.setOnline(true);
    const p1 = outbox.flush();
    const p2 = outbox.flush();
    assert.equal(p1, p2);
    await tick();
    assert.equal(transport.sent.length, 1);
    transport.resolveNext();
    await p1;
    assert.equal(transport.sent.length, 1);
    assert.equal(outbox.pending.length, 0);
  });

  test("going offline mid-send finishes that send, then stops", async () => {
    const transport = new ManualTransport();
    const { outbox } = setup({ transport });
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.enqueue("b", 2);
    outbox.setOnline(true);
    const p = outbox.flush();
    await tick();
    outbox.setOnline(false);
    transport.resolveNext();
    await p;
    assert.deepEqual(transport.sent.map((m) => m.id), ["m1"]);
    assert.deepEqual(outbox.pending.map((m) => m.id), ["m2"]);
  });
});

describe("Part 2: failures", () => {
  test("a retryable failure backs off exponentially and blocks later mutations", async () => {
    const { outbox, transport, advance } = setup();
    const t = transport as ScriptedTransport;
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.enqueue("b", 2);
    t.script = ["retry", "retry"];
    outbox.setOnline(true);
    await outbox.flush();
    assert.deepEqual(t.sent.map((m) => m.id), ["m1"]);
    assert.equal(outbox.pending[0].attempts, 1);
    assert.equal(outbox.pending[0].nextAttemptAt, 1_000_000 + 1000);

    await outbox.flush(); // too early: nothing sent
    assert.equal(t.sent.length, 1);

    advance(1000);
    await outbox.flush(); // second failure → 2s backoff
    assert.equal(outbox.pending[0].attempts, 2);
    assert.equal(outbox.pending[0].nextAttemptAt, 1_000_000 + 1000 + 2000);

    advance(2000);
    await outbox.flush(); // succeeds, then b goes too
    assert.deepEqual(t.sent.map((m) => m.id), ["m1", "m1", "m1", "m2"]);
    assert.equal(outbox.pending.length, 0);
  });

  test("non-TransportError errors (network) are retryable", async () => {
    const { outbox, transport } = setup();
    (transport as ScriptedTransport).script = ["network"];
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.setOnline(true);
    await outbox.flush();
    assert.equal(outbox.pending.length, 1);
    assert.equal(outbox.dead.length, 0);
  });

  test("a non-retryable failure goes to dead and flushing continues", async () => {
    const { outbox, transport } = setup();
    (transport as ScriptedTransport).script = ["fatal"];
    outbox.setOnline(false);
    outbox.enqueue("bad", 1);
    outbox.enqueue("good", 2);
    outbox.setOnline(true);
    await outbox.flush();
    assert.deepEqual(outbox.dead.map((m) => [m.id, m.attempts]), [["m1", 1]]);
    assert.equal(outbox.pending.length, 0);
    assert.deepEqual((transport as ScriptedTransport).sent.map((m) => m.id), ["m1", "m2"]);
  });

  test("maxAttempts moves a mutation to dead and unblocks the queue", async () => {
    const { outbox, transport, advance, storage } = setup({ maxAttempts: 2 });
    (transport as ScriptedTransport).script = ["retry", "retry"];
    outbox.setOnline(false);
    outbox.enqueue("a", 1);
    outbox.enqueue("b", 2);
    outbox.setOnline(true);
    await outbox.flush();
    advance(1000);
    await outbox.flush();
    assert.deepEqual(outbox.dead.map((m) => [m.id, m.attempts]), [["m1", 2]]);
    assert.equal(outbox.pending.length, 0, "b was sent after a died");
    assert.deepEqual(storage.data?.dead.map((m) => m.id), ["m1"]);
  });

  test("retryDead puts dead mutations back at the end with a fresh start", async () => {
    const { outbox, transport } = setup();
    (transport as ScriptedTransport).script = ["fatal"];
    outbox.setOnline(false);
    outbox.enqueue("bad", 1);
    outbox.setOnline(true);
    await outbox.flush();
    outbox.setOnline(false);
    outbox.enqueue("later", 2);
    outbox.retryDead();
    assert.equal(outbox.dead.length, 0);
    assert.deepEqual(outbox.pending.map((m) => [m.id, m.attempts, m.nextAttemptAt]), [
      ["m2", 0, 0],
      ["m1", 0, 0],
    ]);
  });
});

describe("Part 3: coalescing", () => {
  test("same coalesceKey replaces the pending mutation in place", () => {
    const { outbox } = setup();
    outbox.setOnline(false);
    const id1 = outbox.enqueue("markRead", { read: true }, { coalesceKey: "read:t1" });
    outbox.enqueue("archive", { t: "t2" });
    const id2 = outbox.enqueue("markRead", { read: false }, { coalesceKey: "read:t1" });
    assert.equal(id2, id1);
    assert.deepEqual(outbox.pending.map((m) => [m.id, m.payload]), [
      ["m1", { read: false }],
      ["m2", { t: "t2" }],
    ]);
  });

  test("an in-flight mutation is never replaced", async () => {
    const transport = new ManualTransport();
    const { outbox } = setup({ transport });
    outbox.setOnline(false);
    outbox.enqueue("markRead", { read: true }, { coalesceKey: "read:t1" });
    outbox.setOnline(true);
    const p = outbox.flush();
    await tick();
    const id = outbox.enqueue("markRead", { read: false }, { coalesceKey: "read:t1" });
    assert.equal(id, "m2");
    transport.resolveNext();
    await tick();
    transport.resolveNext();
    await p;
    assert.deepEqual(transport.sent.map((m) => [m.id, m.payload]), [
      ["m1", { read: true }],
      ["m2", { read: false }],
    ]);
  });
});
