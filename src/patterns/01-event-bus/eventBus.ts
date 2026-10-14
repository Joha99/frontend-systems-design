/**
 * Pattern 01: Observer / Pub-Sub: a typed Event Bus
 *
 * Patterns: Observer, Mediator. SOLID: Dependency Inversion (publishers and
 * subscribers depend on the bus, not on each other).
 *
 * Where this shows up: a socket manager fanning out server events to many
 * components, a keyboard shortcut hub, cross-component notifications
 * ("thread archived" → list, counter and toast all react).
 *
 * Run the grader:  node --test src/patterns/01-event-bus/
 *
 * ── Part 1 (20 min) ─────────────────────────────────────────────────────────
 * Implement EventBus<Events>, where Events maps event names to payload types:
 *
 *   type AppEvents = { "thread:archived": { id: string }; "online": boolean };
 *   const bus = new EventBus<AppEvents>();
 *   const off = bus.on("thread:archived", (p) => p.id);  // p is typed
 *   bus.emit("thread:archived", { id: "t1" });
 *   off();
 *
 * 1. on(event, listener) registers a listener and returns an unsubscribe
 *    function. Calling the unsubscribe function twice is harmless.
 * 2. Registering the SAME function twice for the same event registers it once.
 * 3. emit(event, payload) calls the event's listeners in the order they were
 *    registered. Emitting an event nobody listens to is fine.
 * 4. off(event, listener) removes a listener.
 * 5. listenerCount(event) returns how many listeners an event has.
 * 6. A listener that throws must NOT stop the other listeners. Report the
 *    error to the `onError` option passed to the constructor
 *    (default: console.error).
 *
 * ── Part 2 (15 min): edge cases that break naive implementations ───────────
 * 7. Snapshot semantics: emit() calls exactly the listeners registered when
 *    emit() started. A listener added during an emit is not called for that
 *    emit. A listener removed during an emit by an EARLIER listener IS still
 *    called for that emit (it was in the snapshot).
 * 8. once(event, listener) is called at most once, even if the listener
 *    itself emits the same event again (re-entrant emit). Returns an
 *    unsubscribe function that works before it fires.
 *
 * ── Part 3 (10 min): async bridge ──────────────────────────────────────────
 * 9. waitFor(event, { signal? }) returns a Promise that resolves with the
 *    payload of the NEXT emit of that event. If the signal aborts first, it
 *    rejects with an Error whose name is "AbortError", and its listener is
 *    removed (listenerCount goes back down). An already-aborted signal
 *    rejects immediately.
 *
 * Talk about: why the bus decouples publishers from subscribers (and the cost:
 * harder to trace who reacts to what); why snapshot semantics; memory leaks
 * when components forget to unsubscribe (the useEffect cleanup).
 */

export type Listener<T> = (payload: T) => void;

export interface EventBusOptions {
  onError?: (error: unknown, event: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventBus<Events extends Record<string, any>> {
  constructor(options: EventBusOptions = {}) {
    throw new Error("not implemented");
  }

  on<K extends keyof Events & string>(
    event: K,
    listener: Listener<Events[K]>,
  ): () => void {
    throw new Error("not implemented");
  }

  once<K extends keyof Events & string>(
    event: K,
    listener: Listener<Events[K]>,
  ): () => void {
    throw new Error("not implemented");
  }

  off<K extends keyof Events & string>(
    event: K,
    listener: Listener<Events[K]>,
  ): void {
    throw new Error("not implemented");
  }

  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void {
    throw new Error("not implemented");
  }

  listenerCount<K extends keyof Events & string>(event: K): number {
    throw new Error("not implemented");
  }

  waitFor<K extends keyof Events & string>(
    event: K,
    options: { signal?: AbortSignal } = {},
  ): Promise<Events[K]> {
    throw new Error("not implemented");
  }
}
