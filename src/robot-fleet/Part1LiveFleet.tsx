/**
 * Robot Fleet Dashboard (Part 1 of 3): Live fleet list
 *
 * A warehouse runs ~1,000 robots. Ops staff keep this page open all shift to
 * watch them. The fake server is in `fleetServer.ts` (read its header; don't
 * edit it).
 *
 * Requirements:
 * 1. On mount, load the snapshot (`fetchSnapshot`), then `connect` with the
 *    snapshot's seq so you don't miss events between the two.
 * 2. Keep robots in a normalized store (by id). Apply robot_updated /
 *    robot_added / robot_removed events.
 * 3. A table, one row per robot: name, status, battery %, position, and
 *    "last seen" ("3s ago").
 *    - Status shown as a coloured badge (error stands out).
 *    - Battery < 20% is highlighted.
 * 4. Summary bar on top: count per status (idle 210 · moving 480 · …).
 * 5. "Stale": a robot with no update for 10 s gets a stale badge and a dimmed
 *    row, even if no new event arrives for it (time passing alone must
 *    update the UI).
 * 6. Loading state for the first load; no layout jump when data arrives.
 *
 * Performance: the server sends ~300 events per second. Your page must stay
 * smooth (scrolling, typing). Don't re-render the whole table on every event.
 *
 * Done when: the counts and rows update live, stale robots show up after
 * ~10 s of silence, and the page stays smooth for a minute.
 *
 * Discussion:
 * - Where do 300 events/s go before they reach React? What's the batching
 *   window, and why that one?
 * - How does "last seen 3s ago" update without an event for that robot?
 *   What re-renders every second, and how do you keep that cheap?
 * - Whose clock decides "stale": the browser's or the server's?
 *
 * Time target: 60 minutes. Plan out loud for 5 minutes first.
 */

// Types you'll want: Robot, FleetEvent, RobotStatus, ServerMessage (import type).
import { useEffect, useReducer, useState, type CSSProperties } from "react";
import {
  fetchSnapshot,
  connect,
  type Robot,
  type FleetEvent,
} from "./fleetServer";
import styles from "./Fleet.module.css";

const STATUS_COLOR_MAP: Record<Robot["status"], string> = {
  idle: "#d6d6d6",
  moving: "#4159ba",
  charging: "#43ba41",
  error: "#dd4949",
  offline: "#3f3f3f",
};

const STATUSES: Array<Robot["status"]> = [
  "idle",
  "moving",
  "charging",
  "error",
  "offline",
];

interface State {
  robots: Record<Robot["id"], Robot>;
  lastAppliedSeq: FleetEvent["seq"] | null;
}

type Action = {
  type: "ADD_ROBOTS";
  payload: { robots: Robot[]; seq: number };
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "ADD_ROBOTS": {
      const { robots, seq } = action.payload;
      const normalizedRobots: Record<Robot["id"], Robot> = {};

      for (const robot of robots) {
        normalizedRobots[robot.id] = robot;
      }

      return {
        robots: normalizedRobots,
        lastAppliedSeq: seq,
      };
    }
    default: {
      return state;
    }
  }
};

const getSecondDiff = (timestamp: number) => {
  const now = Date.now();
  const differenceInSeconds = Math.floor((now - timestamp) / 1000);
  return differenceInSeconds;
};

const StatusDot = ({ status }: { status: Robot["status"] }) => {
  return (
    <div
      className={styles.dot}
      style={{ "--status-color": STATUS_COLOR_MAP[status] } as CSSProperties}
    />
  );
};

export const Part1LiveFleet = () => {
  const [initialLoadStatus, setInitialLoadStatus] = useState<
    "loading" | "loaded" | "error"
  >();
  const [state, dispatch] = useReducer(reducer, {
    robots: {},
    lastAppliedSeq: null,
  });

  useEffect(() => {
    setInitialLoadStatus("loading");
    fetchSnapshot()
      .then(({ robots, seq }) => {
        dispatch({ type: "ADD_ROBOTS", payload: { robots, seq } });
        setInitialLoadStatus("loaded");
      })
      .catch((err) => {
        console.error(err);
        setInitialLoadStatus("error");
      });
  }, []);

  if (initialLoadStatus === "loading") {
    return <div>Getting robot statuses...</div>;
  }

  return (
    <div style={{ width: "100%" }}>
      <h2>Robot Fleet: Part 1</h2>
      <div className={styles.toolbar}>
        <div className={styles["status-list"]}>
          {STATUSES.map((status) => {
            const statusCount = Object.values(state.robots).filter(
              (robot) => robot.status === status,
            ).length;

            return (
              <div key={status}>
                <StatusDot status={status} />
                {status}: {statusCount}
              </div>
            );
          })}
        </div>
        <div className={styles["seq-label"]}>
          Sequence #: {state.lastAppliedSeq}
        </div>
      </div>
      <div className={styles.table}>
        <div className={`${styles["table-row"]} ${styles["table-header"]}`}>
          <div>Name</div>
          <div>Status</div>
          <div>Battery Percent</div>
          <div>Position</div>
          <div>Last Seen</div>
        </div>
        <div>
          {Object.values(state.robots).map((robot) => {
            const { id, name, status, battery, x, y, lastSeenAt } = robot;
            const secondsAgo = getSecondDiff(lastSeenAt);
            const hasLowBattery = battery < 20;

            return (
              <div key={id} className={styles["table-row"]}>
                <div>{name}</div>
                <div>
                  <StatusDot status={status} />
                  {status}
                </div>
                <div
                  className={`${hasLowBattery ? styles["low-battery"] : ""}`}
                >
                  {battery}
                </div>
                <div>
                  ({x.toFixed(3)},{y.toFixed(3)})
                </div>
                <div>{secondsAgo}s ago</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
