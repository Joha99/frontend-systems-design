export interface OutlineNode {
  id: string;
  text: string;
  collapsed: boolean;
  children: OutlineNode[];
}

/** One changed node as the server stores it. `null` in a PATCH = deleted. */
export interface NodePatch {
  id: string;
  text: string;
  collapsed: boolean;
  parentId: string | null;
  index: number; // position among siblings
}

export interface SaveResult {
  savedAt: string;
  version: number;
}

const FAILURE_RATE = 0.15;

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

let version = 1;

const node = (
  id: string,
  text: string,
  children: OutlineNode[] = [],
): OutlineNode => ({ id, text, collapsed: false, children });

const SEED: OutlineNode[] = [
  node("n1", "Interview prep", [
    node("n2", "Systems design", [
      node("n3", "Normalize state"),
      node("n4", "Keyboard navigation"),
      node("n5", "Accessibility"),
    ]),
    node("n6", "Behavioral stories"),
  ]),
  node("n7", "Groceries", [node("n8", "Eggs"), node("n9", "Coffee")]),
  node("n10", "Call mom"),
];

/** Returns the outline in NESTED form. You should normalize it. */
export async function fetchOutline(): Promise<{ nodes: OutlineNode[]; version: number }> {
  await delay();
  return { nodes: structuredClone(SEED), version };
}

/**
 * Saves a batch of changed/deleted nodes.
 * - Rejects ~15% of the time (network error).
 * - Rejects with a CONFLICT error if `baseVersion` is not the latest version.
 */
export async function saveChanges(
  changes: Record<string, NodePatch | null>,
  baseVersion: number,
): Promise<SaveResult> {
  await delay();
  if (baseVersion !== version) {
    throw new Error(`CONFLICT: saved version is ${version}, you sent ${baseVersion}`);
  }
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Network error while saving. Please retry.");
  }
  void changes;
  version += 1;
  return { savedAt: new Date().toISOString(), version };
}
