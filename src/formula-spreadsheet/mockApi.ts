/** Sparse sheet: address ("A1") → raw input as typed ("42", "=A1*2", "hello"). */
export type CellMap = Record<string, string>;

export interface Sheet {
  cells: CellMap;
  version: number;
}

const FAILURE_RATE = 0.15;

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

const db: Sheet = {
  version: 1,
  cells: {
    A1: "Item",
    B1: "Price",
    C1: "Qty",
    D1: "Total",
    A2: "Coffee",
    B2: "4.5",
    C2: "3",
    D2: "=B2*C2",
    A3: "Bagel",
    B3: "2.25",
    C3: "2",
    D3: "=B3*C3",
    A4: "Juice",
    B4: "5",
    C4: "1",
    D4: "=B4*C4",
    A6: "Subtotal",
    D6: "=SUM(D2:D4)",
    A7: "Tax rate",
    D7: "0.08",
    A8: "Total",
    D8: "=D6+D6*D7",
    A10: "Average price",
    D10: "=AVG(B2:B4)",
  },
};

export async function fetchSheet(): Promise<Sheet> {
  await delay(500, 1000);
  return structuredClone(db);
}

/**
 * Saves a batch of edits. `null` means the cell was cleared.
 * - Rejects ~15% of the time (network error).
 * - Rejects with a CONFLICT error if `baseVersion` isn't the latest.
 */
export async function saveCells(
  changes: Record<string, string | null>,
  baseVersion: number,
): Promise<{ version: number }> {
  await delay();
  if (baseVersion !== db.version) {
    throw new Error(`CONFLICT: saved version is ${db.version}, you sent ${baseVersion}`);
  }
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Network error while saving. Please retry.");
  }
  for (const [address, raw] of Object.entries(changes)) {
    if (raw === null || raw === "") delete db.cells[address];
    else db.cells[address] = raw;
  }
  db.version += 1;
  return { version: db.version };
}
