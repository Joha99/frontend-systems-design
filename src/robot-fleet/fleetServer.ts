/**
 * Fake backend for the robot fleet problem. Don't edit this file: treat it as
 * the server. Read the exported API only.
 *
 *   fetchSnapshot()           → { robots, seq }   (like GET /api/robots)
 *   connect({ afterSeq, … })  → a fake WebSocket that streams FleetEvents
 *
 * What it does on purpose (your UI has to cope with all of it):
 * - ~300 updates per second across the fleet, in bursts.
 * - Every event has a fleet-wide `seq` (one counter for the whole stream).
 * - Some robots go quiet for a while (no updates) → "stale" in your UI.
 * - The connection drops every ~40 s. Reconnect with the last seq you applied.
 * - The server only keeps the last 3,000 events. If you're further behind than
 *   that, the first message you get is { type: "too_far_behind" }.
 * - Rarely, an event is lost in transit (a seq is skipped). Detect the gap.
 */

export type RobotStatus = "idle" | "moving" | "charging" | "error" | "offline";

export type Robot = {
  id: string;
  name: string;
  status: RobotStatus;
  battery: number; // 0–100
  x: number; // metres, warehouse floor
  y: number;
  lastSeenAt: number; // epoch ms, server time
};

export type FleetEvent =
  | {
      type: "robot_updated";
      seq: number;
      robotId: string;
      set: Partial<Omit<Robot, "id" | "name">>;
    }
  | { type: "robot_added"; seq: number; robot: Robot }
  | { type: "robot_removed"; seq: number; robotId: string };

export type ServerMessage = FleetEvent | { type: "too_far_behind" };

export type Connection = { close: () => void };

export type ConnectOptions = {
  afterSeq: number;
  onMessage: (message: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const FLEET_SIZE = 1000;
const LOG_LIMIT = 3000;
const TICK_MS = 50;
const UPDATES_PER_TICK = 15;
const DROP_EVERY_MS = 40_000;
const LOSS_RATE = 0.0005;

const statuses: RobotStatus[] = ["idle", "moving", "charging", "error"];

let seq = 0;
const robots = new Map<string, Robot>();
const log: FleetEvent[] = [];
const quietUntil = new Map<string, number>();
const listeners = new Set<(event: FleetEvent) => void>();
let nextRobotNumber = 1;
let started = false;

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const makeRobot = (): Robot => {
  const n = nextRobotNumber++;
  return {
    id: `r${n}`,
    name: `Robot ${String(n).padStart(4, "0")}`,
    status: pick(statuses),
    battery: Math.round(20 + Math.random() * 80),
    x: Math.round(Math.random() * 200),
    y: Math.round(Math.random() * 100),
    lastSeenAt: Date.now(),
  };
};

const record = (event: FleetEvent) => {
  log.push(event);
  if (log.length > LOG_LIMIT) log.shift();
  for (const listener of listeners) listener(event);
};

const randomUpdate = (now: number): FleetEvent | null => {
  const ids = [...robots.keys()];
  const id = pick(ids);
  if ((quietUntil.get(id) ?? 0) > now) return null;

  const robot = robots.get(id)!;
  const set: Partial<Omit<Robot, "id" | "name">> = { lastSeenAt: now };
  const roll = Math.random();

  if (roll < 0.002) {
    // goes quiet for 15–45 s
    quietUntil.set(id, now + 15_000 + Math.random() * 30_000);
  } else if (roll < 0.05) {
    set.status = pick(statuses);
  } else if (robot.status === "moving") {
    set.x = clamp(robot.x + (Math.random() - 0.5) * 4, 0, 200);
    set.y = clamp(robot.y + (Math.random() - 0.5) * 4, 0, 100);
    set.battery = clamp(robot.battery - Math.random() * 0.2, 0, 100);
  } else if (robot.status === "charging") {
    set.battery = clamp(robot.battery + Math.random() * 0.5, 0, 100);
  }

  if (set.battery !== undefined) set.battery = Math.round(set.battery * 10) / 10;
  Object.assign(robot, set);
  return { type: "robot_updated", seq: ++seq, robotId: id, set };
};

const tick = () => {
  const now = Date.now();
  for (let i = 0; i < UPDATES_PER_TICK; i++) {
    const event = randomUpdate(now);
    if (event) record(event);
  }

  const roll = Math.random();
  if (roll < 0.002) {
    const robot = makeRobot();
    robots.set(robot.id, robot);
    record({ type: "robot_added", seq: ++seq, robot: { ...robot } });
  } else if (roll < 0.003 && robots.size > FLEET_SIZE / 2) {
    const id = pick([...robots.keys()]);
    robots.delete(id);
    record({ type: "robot_removed", seq: ++seq, robotId: id });
  }
};

const start = () => {
  if (started) return;
  started = true;
  for (let i = 0; i < FLEET_SIZE; i++) {
    const robot = makeRobot();
    robots.set(robot.id, robot);
  }
  setInterval(tick, TICK_MS);
};

const latency = () => 20 + Math.random() * 80;

/** Like GET /api/robots. Resolves with a copy of every robot and the seq it reflects. */
export const fetchSnapshot = (): Promise<{ robots: Robot[]; seq: number }> => {
  start();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        robots: [...robots.values()].map((r) => ({ ...r })),
        seq,
      });
    }, 300 + Math.random() * 400);
  });
};

/** Like opening a WebSocket. Streams every event with seq > afterSeq, then live events. */
export const connect = ({
  afterSeq,
  onMessage,
  onOpen,
  onClose,
}: ConnectOptions): Connection => {
  start();
  let open = false;
  let closed = false;

  const deliver = (message: ServerMessage) => {
    if (!open || closed) return;
    if ("seq" in message && Math.random() < LOSS_RATE) return; // lost in transit
    onMessage(message);
  };

  const listener = (event: FleetEvent) => deliver(event);

  const openTimer = setTimeout(() => {
    if (closed) return;
    open = true;
    onOpen?.();

    const oldest = log[0]?.seq ?? seq + 1;
    if (afterSeq < oldest - 1) {
      deliver({ type: "too_far_behind" });
    } else {
      for (const event of log) if (event.seq > afterSeq) deliver(event);
    }
    listeners.add(listener);
  }, latency());

  const dropTimer = setTimeout(
    () => close(),
    DROP_EVERY_MS * (0.75 + Math.random() * 0.5),
  );

  const close = () => {
    if (closed) return;
    closed = true;
    open = false;
    clearTimeout(openTimer);
    clearTimeout(dropTimer);
    listeners.delete(listener);
    onClose?.();
  };

  return { close };
};
