export type Label = "bug" | "feature" | "chore";

export interface Column {
  id: string;
  title: string;
  limit?: number; // WIP limit
  cardIds: string[];
}

export interface Card {
  id: string;
  title: string;
  label: Label;
}

export interface Board {
  columns: Column[];
  cards: Card[];
}

const FAILURE_RATE = 0.15;

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

const db: Board = {
  columns: [
    { id: "todo", title: "To Do", cardIds: ["c1", "c2", "c3", "c4"] },
    { id: "doing", title: "In Progress", limit: 3, cardIds: ["c5", "c6"] },
    { id: "review", title: "Review", limit: 2, cardIds: ["c7"] },
    { id: "done", title: "Done", cardIds: ["c8", "c9"] },
  ],
  cards: [
    { id: "c1", title: "Fix login bug", label: "bug" },
    { id: "c2", title: "Add dark mode", label: "feature" },
    { id: "c3", title: "Upgrade React", label: "chore" },
    { id: "c4", title: "Crash on empty cart", label: "bug" },
    { id: "c5", title: "Search filters", label: "feature" },
    { id: "c6", title: "Clean up CSS", label: "chore" },
    { id: "c7", title: "Onboarding flow", label: "feature" },
    { id: "c8", title: "Set up CI", label: "chore" },
    { id: "c9", title: "Broken avatar upload", label: "bug" },
  ],
};

export async function fetchBoard(): Promise<Board> {
  await delay();
  return structuredClone(db);
}

/**
 * Moves a card to `toIndex` (in the FULL, unfiltered column list).
 * - Rejects ~15% of the time (network error).
 * - Rejects if the target column is at its WIP limit.
 * Resolves with the server's copy of the two affected columns.
 */
export async function moveCard(
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Promise<Column[]> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Network error. The move was not saved.");
  }
  const from = db.columns.find((c) => c.cardIds.includes(cardId));
  const to = db.columns.find((c) => c.id === toColumnId);
  if (!from || !to) throw new Error("Card or column not found.");
  if (from !== to && to.limit !== undefined && to.cardIds.length >= to.limit) {
    throw new Error(`${to.title} is at its limit of ${to.limit}.`);
  }
  from.cardIds = from.cardIds.filter((id) => id !== cardId);
  const clamped = Math.max(0, Math.min(toIndex, to.cardIds.length));
  to.cardIds.splice(clamped, 0, cardId);
  return structuredClone(from === to ? [to] : [from, to]);
}
