/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  addLabel,
  archive,
  batch,
  CommandManager,
  markRead,
  type InboxState,
} from "./commands.ts";

const makeState = (): InboxState => ({
  threads: {
    a: { id: "a", subject: "A", archived: false, unread: true, labels: [] },
    b: { id: "b", subject: "B", archived: false, unread: false, labels: ["work"] },
    c: { id: "c", subject: "C", archived: true, unread: true, labels: [] },
  },
});

const deepFreeze = <T>(obj: T): T => {
  Object.values(obj as object).forEach((v) => {
    if (v && typeof v === "object") deepFreeze(v);
  });
  return Object.freeze(obj);
};

describe("Part 1: commands", () => {
  test("archive sets archived and undo restores previous values", () => {
    const s0 = deepFreeze(makeState());
    const cmd = archive(["a", "c"]);
    const s1 = cmd.execute(s0);
    assert.equal(s1.threads.a.archived, true);
    assert.equal(s1.threads.c.archived, true);
    const s2 = cmd.undo(s1);
    assert.equal(s2.threads.a.archived, false);
    assert.equal(s2.threads.c.archived, true, "c was already archived");
  });

  test("commands never mutate their input", () => {
    const s0 = deepFreeze(makeState());
    assert.doesNotThrow(() => {
      const cmd = batch("All", [archive(["a"]), markRead(["a"]), addLabel(["a"], "x")]);
      cmd.undo(cmd.execute(s0));
    });
    assert.equal(s0.threads.a.archived, false);
  });

  test("unchanged threads keep the same object reference", () => {
    const s0 = makeState();
    const s1 = archive(["a"]).execute(s0);
    assert.notEqual(s1.threads.a, s0.threads.a);
    assert.equal(s1.threads.b, s0.threads.b);
  });

  test("markRead undo only restores threads that were unread", () => {
    const s0 = makeState();
    const cmd = markRead(["a", "b"]);
    const s1 = cmd.execute(s0);
    assert.equal(s1.threads.a.unread, false);
    assert.equal(s1.threads.b.unread, false);
    const s2 = cmd.undo(s1);
    assert.equal(s2.threads.a.unread, true);
    assert.equal(s2.threads.b.unread, false, "b was already read");
  });

  test("addLabel adds without duplicates; undo only removes what it added", () => {
    const s0 = makeState();
    const cmd = addLabel(["a", "b"], "work");
    const s1 = cmd.execute(s0);
    assert.deepEqual(s1.threads.a.labels, ["work"]);
    assert.deepEqual(s1.threads.b.labels, ["work"]);
    const s2 = cmd.undo(s1);
    assert.deepEqual(s2.threads.a.labels, []);
    assert.deepEqual(s2.threads.b.labels, ["work"], "b already had it");
  });

  test("unknown ids are ignored", () => {
    const s0 = makeState();
    const cmd = archive(["a", "nope"]);
    const s1 = cmd.execute(s0);
    assert.equal(s1.threads.nope, undefined);
    const s2 = cmd.undo(s1);
    assert.equal(s2.threads.nope, undefined);
    assert.equal(s2.threads.a.archived, false);
  });

  test("batch runs in order and undoes in reverse order", () => {
    const s0 = makeState();
    // Label "a" then archive it; undo must cleanly reverse both.
    const cmd = batch("Triage", [addLabel(["a"], "done"), archive(["a"]), markRead(["a"])]);
    const s1 = cmd.execute(s0);
    assert.deepEqual(s1.threads.a, { ...s0.threads.a, labels: ["done"], archived: true, unread: false });
    const s2 = cmd.undo(s1);
    assert.deepEqual(s2.threads.a, s0.threads.a);
  });

  test("batch undo order matters: the same label added twice", () => {
    const s0 = makeState();
    // The second addLabel sees "x" already present, so it records nothing to
    // undo. Undoing in reverse order removes "x" exactly once (the first one).
    const cmd = batch("Twice", [addLabel(["a"], "x"), addLabel(["a"], "x")]);
    const s2 = cmd.undo(cmd.execute(s0));
    assert.deepEqual(s2.threads.a.labels, []);
  });

  test("labels", () => {
    assert.equal(archive(["a", "b"]).label, "Archive 2 threads");
    assert.equal(archive(["a"]).label, "Archive 1 thread");
    assert.equal(markRead(["a"]).label, "Mark 1 thread read");
    assert.equal(markRead(["a", "b", "c"]).label, "Mark 3 threads read");
    assert.equal(addLabel(["a"], "work").label, 'Label 1 thread "work"');
    assert.equal(batch("Triage", []).label, "Triage");
  });
});

describe("Part 2: CommandManager", () => {
  test("execute, undo, redo", () => {
    const m = new CommandManager(makeState());
    assert.equal(m.canUndo, false);
    m.execute(archive(["a"]));
    assert.equal(m.state.threads.a.archived, true);
    assert.equal(m.canUndo, true);
    assert.equal(m.undo(), true);
    assert.equal(m.state.threads.a.archived, false);
    assert.equal(m.canRedo, true);
    assert.equal(m.redo(), true);
    assert.equal(m.state.threads.a.archived, true);
  });

  test("undo/redo with empty stacks return false and change nothing", () => {
    const m = new CommandManager(makeState());
    const before = m.state;
    assert.equal(m.undo(), false);
    assert.equal(m.redo(), false);
    assert.equal(m.state, before);
  });

  test("a new command clears the redo stack", () => {
    const m = new CommandManager(makeState());
    m.execute(archive(["a"]));
    m.undo();
    m.execute(markRead(["a"]));
    assert.equal(m.canRedo, false);
    assert.equal(m.redo(), false);
  });

  test("multiple undos walk back in order", () => {
    const m = new CommandManager(makeState());
    m.execute(archive(["a"]));
    m.execute(markRead(["a"]));
    m.execute(addLabel(["a"], "x"));
    m.undo();
    assert.deepEqual(m.state.threads.a.labels, []);
    assert.equal(m.state.threads.a.unread, false);
    m.undo();
    assert.equal(m.state.threads.a.unread, true);
    assert.equal(m.state.threads.a.archived, true);
    m.undo();
    assert.equal(m.state.threads.a.archived, false);
    assert.equal(m.canUndo, false);
  });

  test("limit drops the oldest history entries", () => {
    const m = new CommandManager(makeState(), { limit: 2 });
    m.execute(archive(["a"]));
    m.execute(markRead(["a"]));
    m.execute(addLabel(["a"], "x"));
    assert.equal(m.undo(), true);
    assert.equal(m.undo(), true);
    assert.equal(m.undo(), false, "the archive fell off the history");
    assert.equal(m.state.threads.a.archived, true);
  });

  test("subscribe is notified after execute/undo/redo and can unsubscribe", () => {
    const m = new CommandManager(makeState());
    const seen: boolean[] = [];
    const off = m.subscribe((s) => seen.push(s.threads.a.archived));
    m.execute(archive(["a"]));
    m.undo();
    m.redo();
    m.undo();
    m.undo(); // nothing to undo: no notification
    off();
    m.redo();
    assert.deepEqual(seen, [true, false, true, false]);
  });
});
