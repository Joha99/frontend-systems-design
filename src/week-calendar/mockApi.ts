export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
}

export type EventInput = Omit<CalendarEvent, "id">;

const FAILURE_RATE = 0.15;

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

/** Monday 00:00 (local time) of the week containing `date`. */
const mondayOf = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

const at = (monday: Date, dayOffset: number, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

// Seeded into the CURRENT week. Includes a chain of transitive overlaps on
// Monday, touching events on Wednesday, and a 4-way overlap on Friday.
const SEED: [string, number, string, string][] = [
  ["Standup", 0, "09:00", "09:30"],
  ["Design review", 0, "09:15", "10:30"],
  ["1:1 with manager", 0, "10:00", "11:00"],
  ["Lunch", 0, "12:00", "13:00"],
  ["Focus time", 1, "13:00", "16:00"],
  ["Interview", 1, "14:00", "15:00"],
  ["Planning", 2, "10:00", "11:00"],
  ["Retro", 2, "11:00", "12:00"],
  ["All hands", 4, "15:00", "16:30"],
  ["Demo prep", 4, "15:00", "15:30"],
  ["Customer call", 4, "15:15", "16:00"],
  ["Coffee chat", 4, "15:30", "16:00"],
];

let nextId = 1;
const thisMonday = mondayOf(new Date());
const db = new Map<string, CalendarEvent>();

for (const [title, day, start, end] of SEED) {
  const id = `e${nextId++}`;
  db.set(id, { id, title, start: at(thisMonday, day, start), end: at(thisMonday, day, end) });
}
// A recurring standup in the weeks around this one, so week navigation has data.
for (let week = -4; week <= 4; week++) {
  if (week === 0) continue;
  const monday = new Date(thisMonday);
  monday.setDate(monday.getDate() + week * 7);
  for (let day = 0; day < 5; day++) {
    const id = `e${nextId++}`;
    db.set(id, { id, title: "Standup", start: at(monday, day, "09:00"), end: at(monday, day, "09:15") });
  }
}

/**
 * Events that START within [from, to). Pass ISO strings.
 * Slow on purpose: consider caching weeks and prefetching neighbors.
 */
export async function fetchEvents(from: string, to: string): Promise<CalendarEvent[]> {
  await delay(500, 1200);
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return [...db.values()]
    .filter((e) => {
      const s = new Date(e.start).getTime();
      return s >= f && s < t;
    })
    .map((e) => ({ ...e }));
}

const validate = (input: EventInput) => {
  if (new Date(input.end) <= new Date(input.start)) {
    throw new Error("Event must end after it starts.");
  }
};

/** Rejects ~15% of the time. Resolves with the server-assigned id. */
export async function createEvent(input: EventInput): Promise<CalendarEvent> {
  await delay();
  validate(input);
  if (Math.random() < FAILURE_RATE) throw new Error("Couldn't create event.");
  const event = { ...input, id: `e${nextId++}` };
  db.set(event.id, event);
  return { ...event };
}

/** Rejects ~15% of the time, or if the event no longer exists. */
export async function updateEvent(id: string, patch: Partial<EventInput>): Promise<CalendarEvent> {
  await delay();
  const existing = db.get(id);
  if (!existing) throw new Error("Event not found.");
  const updated = { ...existing, ...patch };
  validate(updated);
  if (Math.random() < FAILURE_RATE) throw new Error("Couldn't save changes.");
  db.set(id, updated);
  return { ...updated };
}

/** Rejects ~15% of the time. */
export async function deleteEvent(id: string): Promise<void> {
  await delay();
  if (Math.random() < FAILURE_RATE) throw new Error("Couldn't delete event.");
  db.delete(id);
}
