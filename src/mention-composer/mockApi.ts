export interface User {
  id: number;
  firstName: string;
  lastName: string;
  handle: string;
}

export interface Mention {
  userId: number;
  start: number; // index of "@" in text
  end: number; // index after the last character of "@handle"
}

export interface Message {
  id: string;
  text: string;
  mentions: Mention[];
  sentAt: string;
}

const FAILURE_RATE = 0.1;

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

const FIRST_NAMES = [
  "John", "Joanna", "Jordan", "Josh", "Maria", "Mario", "Mark", "Marcus",
  "Sam", "Samantha", "Alex", "Alexa", "Chris", "Christina", "Dana", "Daniel",
  "Priya", "Pablo", "Kim", "Kenji",
];

const LAST_NAMES = [
  "Smith", "Smithers", "Johnson", "Jones", "Lee", "Lopez", "Nguyen", "Garcia",
  "Kim", "Patel", "Brown", "Brooks", "Chen", "Cho", "Davis", "Diaz", "Evans",
  "Martin", "Martinez", "Miller", "Moore", "Park", "Perez", "Wilson", "Wong",
];

// 20 x 25 = 500 deterministic users. Many share prefixes on purpose.
const USERS: User[] = FIRST_NAMES.flatMap((firstName, i) =>
  LAST_NAMES.map((lastName, j) => ({
    id: i * LAST_NAMES.length + j + 1,
    firstName,
    lastName,
    handle: `${firstName}.${lastName}`.toLowerCase(),
  })),
);

const messages: Message[] = [];

/** Returns all 500 users in one response (slow: build your index once). */
export async function fetchUsers(): Promise<User[]> {
  await delay(800, 1500);
  return structuredClone(USERS);
}

/** User ids this user mentioned most recently, most recent first. */
export async function fetchRecentMentions(): Promise<number[]> {
  await delay();
  return [7, 212, 58];
}

/**
 * Sends a message.
 * - Rejects ~10% of the time (network error).
 * - Rejects with "INVALID_MENTION" if any mention's range does not contain
 *   exactly "@" + that user's handle. (Catches range-tracking bugs.)
 */
export async function sendMessage(text: string, mentions: Mention[]): Promise<Message> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Network error. Message not sent.");
  }
  for (const m of mentions) {
    const user = USERS.find((u) => u.id === m.userId);
    const slice = text.slice(m.start, m.end);
    if (!user || slice !== `@${user.handle}`) {
      throw new Error(
        `INVALID_MENTION: range ${m.start}-${m.end} is "${slice}", expected "@${user?.handle}"`,
      );
    }
  }
  const message: Message = {
    id: `m${messages.length + 1}`,
    text,
    mentions: structuredClone(mentions),
    sentAt: new Date().toISOString(),
  };
  messages.push(message);
  return structuredClone(message);
}
