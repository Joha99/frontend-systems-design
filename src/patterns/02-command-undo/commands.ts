/**
 * Pattern 02: Command: Inbox Actions with Undo / Redo
 *
 * Patterns: Command, Composite (batch), Observer (subscribe).
 * SOLID: Open/Closed (new actions = new command objects; the manager never
 * changes), Single Responsibility (commands know HOW to change state; the
 * manager knows WHEN and keeps history).
 *
 * Where this shows up: Superhuman's "e to archive → Undo" toast, undo/redo in
 * editors, keyboard shortcuts mapped to commands, an offline outbox that
 * replays commands (see 05-offline-outbox).
 *
 * Run the grader:  node --test 'src/patterns/02-command-undo/*.test.ts'
 *
 * State is IMMUTABLE: execute/undo return a NEW InboxState and never mutate
 * the one they receive (threads that don't change can be reused as-is).
 *
 * ── Part 1 (25 min): commands ───────────────────────────────────────────────
 * Each factory returns a Command. A command must remember whatever it needs
 * to undo EXACTLY what it did, and nothing more:
 *
 * 1. archive(ids): sets archived = true. Undo restores each thread's previous
 *    `archived` value (a thread that was already archived stays archived).
 * 2. markRead(ids): sets unread = false. Undo makes unread again ONLY the
 *    threads that were unread before this command ran.
 * 3. addLabel(ids, label): adds the label (no duplicates). Undo removes it
 *    ONLY from threads that didn't already have it.
 * 4. Unknown ids are ignored (no crash, nothing to undo for them).
 * 5. batch(label, commands): runs commands in order; undo runs their undos in
 *    REVERSE order. It's one entry in the history.
 *
 * Each command has a human-readable `label` for the toast:
 *   archive(["a","b"]).label === "Archive 2 threads"   ("Archive 1 thread")
 *   markRead(["a"]).label    === "Mark 1 thread read"
 *   addLabel(["a"], "work").label === "Label 1 thread \"work\""
 *   batch("Triage", [...]).label === "Triage"
 *
 * ── Part 2 (20 min): CommandManager ────────────────────────────────────────
 * 6. execute(cmd): applies it, pushes it on the undo stack, CLEARS the redo
 *    stack.
 * 7. undo() / redo(): return false (and do nothing) when there's nothing to
 *    undo / redo, else true. redo re-runs the command's execute.
 * 8. canUndo / canRedo getters, and `state` getter for the current state.
 * 9. `limit` option (default 50): keep at most that many undo entries; drop
 *    the OLDEST.
 * 10. subscribe(listener): call listener(state) after every execute / undo /
 *     redo that changed something. Returns an unsubscribe function.
 *
 * Talk about: why commands capture "before" values instead of storing whole
 * state snapshots (memory, and they compose with other users' changes);
 * why redo is cleared on a new action; how this maps to a server
 * (each command also produces a mutation for the outbox).
 */

export interface Thread {
  id: string;
  subject: string;
  archived: boolean;
  unread: boolean;
  labels: string[];
}

export interface InboxState {
  threads: Record<string, Thread>;
}

export interface Command {
  readonly label: string;
  execute(state: InboxState): InboxState;
  undo(state: InboxState): InboxState;
}

export function archive(ids: string[]): Command {
  throw new Error("not implemented");
}

export function markRead(ids: string[]): Command {
  throw new Error("not implemented");
}

export function addLabel(ids: string[], label: string): Command {
  throw new Error("not implemented");
}

export function batch(label: string, commands: Command[]): Command {
  throw new Error("not implemented");
}

export class CommandManager {
  constructor(initialState: InboxState, options: { limit?: number } = {}) {
    throw new Error("not implemented");
  }

  get state(): InboxState {
    throw new Error("not implemented");
  }

  get canUndo(): boolean {
    throw new Error("not implemented");
  }

  get canRedo(): boolean {
    throw new Error("not implemented");
  }

  execute(command: Command): void {
    throw new Error("not implemented");
  }

  undo(): boolean {
    throw new Error("not implemented");
  }

  redo(): boolean {
    throw new Error("not implemented");
  }

  subscribe(listener: (state: InboxState) => void): () => void {
    throw new Error("not implemented");
  }
}
