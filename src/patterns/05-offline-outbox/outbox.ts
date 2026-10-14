/**
 * Pattern 05: Outbox Queue: Reliable Mutations on a Flaky Network
 *
 * Patterns: Queue / Outbox, Command (each mutation is data that can be
 * replayed), Repository-ish persistence behind an interface, Strategy for
 * the retry policy. SOLID: Dependency Inversion (Transport and Storage are
 * injected, so tests run with no network and no IndexedDB), Single
 * Responsibility (the outbox only does delivery: it doesn't know what an
 * "archive" means).
 *
 * Where this shows up: offline-first apps (Superhuman, Linear, Notion). The
 * UI applies a change locally right away, then the outbox makes sure the
 * server eventually gets it, in order, exactly once from the user's view.
 * This is the "client-server communication" box in design/02 and design/06.
 *
 * Run the grader:  node --test 'src/patterns/05-offline-outbox/*.test.ts'
 *
 * ── Part 1 (25 min): queue + delivery ──────────────────────────────────────
 * 1. enqueue(type, payload) adds a mutation to the END of `pending` with a new
 *    id (from the `generateId` option, default crypto.randomUUID()),
 *    attempts 0, nextAttemptAt 0. Returns the id. It is persisted
 *    IMMEDIATELY: storage.save({ pending, dead }) before enqueue returns.
 * 2. The constructor restores { pending, dead } from storage.load() (null =
 *    empty). That's crash/reload recovery.
 * 3. flush() sends pending mutations IN ORDER, ONE AT A TIME, via
 *    transport.send({ id, type, payload }). On success the mutation is
 *    removed and storage is saved. The same id is sent on every retry: the
 *    server uses it as an idempotency key.
 * 4. Offline (`setOnline(false)`): flush() resolves without sending.
 *    setOnline(true) starts a flush automatically. The outbox starts online.
 *    Going offline while a send is in flight: that send finishes and is
 *    handled normally, then flushing stops.
 * 5. Single flight: calling flush() while a flush is running returns the
 *    SAME promise; it never sends a mutation twice in parallel.
 *
 * ── Part 2 (20 min): failures ──────────────────────────────────────────────
 * 6. A RETRYABLE failure (a TransportError with retryable = true, or ANY other
 *    thrown error, such as a network error) increments `attempts`:
 *    - attempts reached maxAttempts (default 5)? Move it to `dead` and keep
 *      flushing the next one.
 *    - otherwise set nextAttemptAt = now() + baseDelayMs * 2^(attempts - 1)
 *      (baseDelayMs default 1000: 1s, 2s, 4s, …), save, and STOP this flush.
 *      Later mutations wait behind it: order matters (archive-then-unarchive
 *      must not arrive reversed).
 * 7. A NON-retryable TransportError (e.g. a 400 validation error) increments
 *    attempts, moves the mutation straight to `dead`, and flushing continues.
 * 8. flush() never sends a mutation whose nextAttemptAt is in the future
 *    (now() < nextAttemptAt); it stops there instead.
 * 9. retryDead() moves every dead mutation back to the END of pending with
 *    attempts 0 and nextAttemptAt 0, and saves.
 *
 * ── Part 3 (10 min): coalescing ────────────────────────────────────────────
 * 10. enqueue(type, payload, { coalesceKey }): if a PENDING mutation with the
 *     same coalesceKey exists and is NOT currently being sent, replace its
 *     type and payload in place (same position, same id) and return its id.
 *     If the matching mutation is in flight, enqueue a new one as usual.
 *     e.g. toggling "read" on one thread 5 times offline sends 1 request.
 *
 * Talk about: why persist before applying; why head-of-line blocking (and
 * when you'd relax it: independent keys could go in parallel queues); what
 * "exactly once" really means here (at-least-once delivery + idempotent
 * server = effectively once); what the UI shows for dead mutations.
 */

export class TransportError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "TransportError";
    this.retryable = retryable;
  }
}

export interface Mutation {
  id: string;
  type: string;
  payload: unknown;
  attempts: number;
  /** Epoch ms. 0 = can be sent right away. */
  nextAttemptAt: number;
  coalesceKey?: string;
}

export interface Transport {
  send(mutation: { id: string; type: string; payload: unknown }): Promise<void>;
}

export interface OutboxData {
  pending: Mutation[];
  dead: Mutation[];
}

export interface OutboxStorage {
  load(): OutboxData | null;
  save(data: OutboxData): void;
}

/** ✅ Provided: an in-memory storage. In the browser this would be
 *  IndexedDB or localStorage behind the same interface. */
export class MemoryStorage implements OutboxStorage {
  data: OutboxData | null;
  saves = 0;

  constructor(initial: OutboxData | null = null) {
    this.data = initial ? structuredClone(initial) : null;
  }

  load(): OutboxData | null {
    return this.data ? structuredClone(this.data) : null;
  }

  save(data: OutboxData): void {
    this.saves++;
    this.data = structuredClone(data);
  }
}

export interface OutboxOptions {
  transport: Transport;
  storage: OutboxStorage;
  now?: () => number;
  generateId?: () => string;
  maxAttempts?: number;
  baseDelayMs?: number;
}

export class Outbox {
  constructor(options: OutboxOptions) {
    throw new Error("not implemented");
  }

  get pending(): readonly Mutation[] {
    throw new Error("not implemented");
  }

  get dead(): readonly Mutation[] {
    throw new Error("not implemented");
  }

  get online(): boolean {
    throw new Error("not implemented");
  }

  setOnline(online: boolean): void {
    throw new Error("not implemented");
  }

  enqueue(type: string, payload: unknown, options: { coalesceKey?: string } = {}): string {
    throw new Error("not implemented");
  }

  flush(): Promise<void> {
    throw new Error("not implemented");
  }

  retryDead(): void {
    throw new Error("not implemented");
  }
}
