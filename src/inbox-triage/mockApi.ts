export interface Thread {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  receivedAt: string; // ISO string
  read: boolean;
  starred: boolean;
}

export interface ThreadPage {
  threads: Thread[];
  nextCursor: string | null;
}

const PAGE_SIZE = 25;
const TOTAL_THREADS = 120;
const FAILURE_RATE = 0.2;

const SENDERS = [
  "GitHub", "Linear", "Figma", "Mom", "Recruiter @ Acme", "Vercel",
  "Slack", "Jordan Lee", "Priya Patel", "Calendar",
];
const SUBJECTS = [
  "Your weekly digest", "PR review requested", "Re: interview next week",
  "Build failed on main", "Design feedback", "Dinner Sunday?",
  "Invoice available", "New comment on your issue", "Offer details",
  "Reminder: standup moved",
];

const db: Thread[] = Array.from({ length: TOTAL_THREADS }, (_, i) => ({
  id: `t${i + 1}`,
  sender: SENDERS[i % SENDERS.length],
  subject: `${SUBJECTS[(i * 7) % SUBJECTS.length]} #${i + 1}`,
  snippet: "Lorem ipsum dolor sit amet, consectetur adipiscing elit…",
  receivedAt: new Date(Date.UTC(2026, 8, 25, 12) - i * 37 * 60_000).toISOString(),
  read: i % 3 === 0,
  starred: i % 11 === 0,
}));

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

const maybeFail = (action: string) => {
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`${action} failed. Please try again.`);
  }
};

const byId = (ids: string[]) => db.filter((t) => ids.includes(t.id));

/** Cursor is the id of the last thread of the previous page (null = first page). */
export async function fetchThreads(cursor: string | null): Promise<ThreadPage> {
  await delay();
  const inbox = db.filter((t) => !archived.has(t.id));
  const start = cursor === null ? 0 : inbox.findIndex((t) => t.id === cursor) + 1;
  const threads = inbox.slice(start, start + PAGE_SIZE).map((t) => ({ ...t }));
  const last = threads[threads.length - 1];
  const hasMore = start + PAGE_SIZE < inbox.length;
  return { threads, nextCursor: hasMore && last ? last.id : null };
}

const archived = new Set<string>();

export async function archiveThreads(ids: string[], archive = true): Promise<void> {
  await delay();
  maybeFail(archive ? "Archive" : "Unarchive");
  ids.forEach((id) => (archive ? archived.add(id) : archived.delete(id)));
}

export async function setStarred(ids: string[], starred: boolean): Promise<void> {
  await delay();
  maybeFail(starred ? "Star" : "Unstar");
  byId(ids).forEach((t) => (t.starred = starred));
}

export async function setRead(ids: string[], read: boolean): Promise<void> {
  await delay(100, 300);
  byId(ids).forEach((t) => (t.read = read));
}
