/** ✅ PROVIDED: don't edit. A fake backend with latency and random failures. */

export interface Contact {
  name: string;
  email: string;
}

export interface DraftPayload {
  id: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  attachments: Array<{ name: string; sizeBytes: number }>;
}

const CONTACTS: Contact[] = [
  { name: "Ann Lee", email: "ann@acme.com" },
  { name: "Bo Kim", email: "bo@acme.com" },
  { name: "Cara Diaz", email: "cara@globex.com" },
  { name: "Dev Patel", email: "dev@initech.io" },
  { name: "Eli Park", email: "eli@acme.com" },
  { name: "Fran Moss", email: "fran@globex.com" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function searchContacts(query: string, signal?: AbortSignal): Promise<Contact[]> {
  await wait(250 + Math.random() * 250);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const q = query.toLowerCase();
  return CONTACTS.filter((c) => c.name.toLowerCase().includes(q) || c.email.includes(q));
}

let saveCount = 0;
export async function saveDraft(draft: DraftPayload): Promise<{ id: string; savedAt: number; version: number }> {
  await wait(400);
  if (Math.random() < 0.15) throw new Error("Network error while saving draft");
  return { id: draft.id, savedAt: Date.now(), version: ++saveCount };
}

export async function sendMessage(draft: DraftPayload): Promise<{ messageId: string }> {
  await wait(700);
  if (Math.random() < 0.2) throw new Error("Send failed. Try again.");
  return { messageId: `msg_${draft.id}` };
}
