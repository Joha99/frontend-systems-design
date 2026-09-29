export interface Note {
  id: string;
  title: string;
  body: string;
}

/** The full new state of a changed note. */
export type NotePatch = Omit<Note, "id">;

export interface SaveResult {
  version: number;
  savedAt: string;
}

export interface NetworkSettings {
  minDelay: number;
  maxDelay: number;
  failureRate: number; // 0 to 1
}

const network: NetworkSettings = { minDelay: 300, maxDelay: 900, failureRate: 0.15 };

/** Change latency / failure rate at runtime (wire this to dev controls). */
export function setNetwork(settings: Partial<NetworkSettings>) {
  Object.assign(network, settings);
}

export function getNetwork(): NetworkSettings {
  return { ...network };
}

const delay = () =>
  new Promise((resolve) =>
    setTimeout(resolve, network.minDelay + Math.random() * (network.maxDelay - network.minDelay)),
  );

const db: { version: number; notes: Note[] } = {
  version: 1,
  notes: [
    { id: "a", title: "Groceries", body: "Eggs, coffee, bread" },
    { id: "b", title: "Interview prep", body: "Debounce vs. throttle" },
    { id: "c", title: "Gift ideas", body: "" },
    { id: "d", title: "Books to read", body: "Designing Data-Intensive Applications" },
  ],
};

let saveInFlight = false;

/** Returns the SERVER's current copy. Use it to check nothing was lost. */
export async function fetchNotes(): Promise<{ notes: Note[]; version: number }> {
  await delay();
  return structuredClone({ notes: db.notes, version: db.version });
}

/**
 * Saves a batch of changed notes: { [noteId]: { title, body } }.
 * Unlike most mocks in this repo, changes ARE stored, so fetchNotes()
 * shows exactly what the server has.
 *
 * Rejects:
 * - "CONCURRENT_SAVE" immediately if another save is still in flight.
 *   (Your client should never trigger this.)
 * - "CONFLICT" if baseVersion is not the latest version.
 * - "Network error" at the configured failure rate. Nothing is stored.
 */
export async function saveNotes(
  changes: Record<string, NotePatch>,
  baseVersion: number,
): Promise<SaveResult> {
  if (saveInFlight) {
    console.error("saveNotes called while another save was in flight");
    throw new Error("CONCURRENT_SAVE: another save is still in flight");
  }
  saveInFlight = true;
  try {
    await delay();
    if (baseVersion !== db.version) {
      throw new Error(`CONFLICT: server is at version ${db.version}, you sent ${baseVersion}`);
    }
    if (Math.random() < network.failureRate) {
      throw new Error("Network error. Nothing was saved.");
    }
    for (const [id, patch] of Object.entries(changes)) {
      const note = db.notes.find((n) => n.id === id);
      if (!note) throw new Error(`Unknown note id "${id}"`);
      note.title = patch.title;
      note.body = patch.body;
    }
    db.version += 1;
    return { version: db.version, savedAt: new Date().toISOString() };
  } finally {
    saveInFlight = false;
  }
}
