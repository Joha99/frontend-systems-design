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
import {
  memo,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  fetchSnapshot,
  connect,
  type Robot,
  type ServerMessage,
} from "./fleetServer";
import styles from "./Fleet.module.css";
import { timeStore } from "./timeStore";

const BATCH_UPDATE_INTERVAL_MS = 1000; // 1s

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

type RobotMap = Record<Robot["id"], Robot>;

type State = {
  robots: RobotMap;
  connectionStatus: "disconnected" | "connected" | null;
  lastAppliedSeq: number;
};

type Action =
  | {
      type: "ADD_ROBOTS";
      payload: { robots: Robot[]; seq: number };
    }
  | {
      type: "SET_CONNECTION_STATUS";
      payload: { connectionStatus: State["connectionStatus"] };
    }
  | {
      type: "BATCH_UPDATE_ROBOTS";
      payload: {
        events: ServerMessage[];
      };
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_CONNECTION_STATUS": {
      return {
        ...state,
        connectionStatus: action.payload.connectionStatus,
      };
    }
    case "ADD_ROBOTS": {
      const { robots, seq } = action.payload;
      const normalizedRobots: RobotMap = {};

      for (const robot of robots) {
        normalizedRobots[robot.id] = robot;
      }

      const newState: State = {
        lastAppliedSeq: seq,
        connectionStatus: "connected",
        robots: normalizedRobots,
      };

      return newState;
    }
    case "BATCH_UPDATE_ROBOTS": {
      const newRobots = { ...state.robots };
      let lastAppliedSeq = state.lastAppliedSeq;

      for (const event of action.payload.events) {
        if (event.type !== "too_far_behind" && event.seq <= lastAppliedSeq) {
          continue;
        }

        switch (event.type) {
          case "robot_added": {
            newRobots[event.robot.id] = event.robot;
            lastAppliedSeq = event.seq;
            break;
          }
          case "robot_removed": {
            delete newRobots[event.robotId];
            lastAppliedSeq = event.seq;
            break;
          }
          case "robot_updated": {
            newRobots[event.robotId] = {
              ...newRobots[event.robotId],
              ...event.set,
            };
            lastAppliedSeq = event.seq;
            break;
          }
          case "too_far_behind": {
            // todo: have to fetchsnapshot again
            return state;
          }
        }
      }

      const newState: State = {
        ...state,
        lastAppliedSeq,
        robots: newRobots,
      };

      return newState;
    }
    default: {
      return state;
    }
  }
};

const getSecondDiff = (timestamp: number, now: number) => {
  return Math.max(Math.floor((now - timestamp) / 1000), 0);
};

const StatusDot = ({ status }: { status: Robot["status"] }) => {
  return (
    <div
      className={styles.dot}
      style={{ "--status-color": STATUS_COLOR_MAP[status] } as CSSProperties}
    />
  );
};

const StaleBadge = () => {
  return <div className={styles["stale-badge"]}>stale</div>;
};

const LastSeenCell = ({ lastSeenAt }: { lastSeenAt: Robot["lastSeenAt"] }) => {
  const time = useSyncExternalStore(timeStore.subscribe, timeStore.getSnapshot);
  const secondDiff = getSecondDiff(lastSeenAt, time);

  return <div>{secondDiff}s ago</div>;
};

const TableRow = memo(({ robot }: { robot: Robot }) => {
  const { id, name, status, battery, lastSeenAt, x, y } = robot;

  const isStale = useSyncExternalStore(timeStore.subscribe, () =>
    timeStore.getIsStale(lastSeenAt),
  );

  const hasLowBattery = battery < 20;
  const formattedCoordinates = [x.toFixed(3), y.toFixed(3)];

  return (
    <div
      key={id}
      className={`${styles["table-row"]} ${isStale ? styles["stale-row"] : ""}`}
    >
      <div>{name}</div>
      <div className={styles["status-cell"]}>
        <StatusDot status={status} />
        {status}
        {isStale && <StaleBadge />}
      </div>
      <div className={`${hasLowBattery ? styles["low-battery"] : ""}`}>
        {battery}
      </div>
      <div>
        ({formattedCoordinates[0]},{formattedCoordinates[1]})
      </div>
      <LastSeenCell lastSeenAt={lastSeenAt} />
    </div>
  );
});

export const Part1LiveFleet = () => {
  const [initialLoadStatus, setInitialLoadStatus] = useState<
    "loading" | "loaded" | "error"
  >();
  const [state, dispatch] = useReducer(reducer, {
    robots: {},
    connectionStatus: null,
    lastAppliedSeq: 0,
  });

  const lastAppliedSeqRef = useRef<number>(0);
  const closeRef = useRef<() => void>(null);
  const batchedEventsRef = useRef<ServerMessage[]>([]);

  const onMessage = (message: ServerMessage) => {
    batchedEventsRef.current.push(message);
  };

  const onOpen = () => {
    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { connectionStatus: "connected" },
    });
  };

  const onClose = () => {
    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { connectionStatus: "disconnected" },
    });
  };

  useEffect(() => {
    let cancelled = false;
    setInitialLoadStatus("loading");
    fetchSnapshot()
      .then(({ robots, seq }) => {
        // To make sure I don't add robots twice when useEffect is on strict mode
        if (!cancelled) {
          dispatch({ type: "ADD_ROBOTS", payload: { robots, seq } });
          setInitialLoadStatus("loaded");
          closeRef.current = connect({
            afterSeq: seq,
            onMessage,
            onOpen,
            onClose,
          }).close;
        }
      })
      .catch((err) => {
        setInitialLoadStatus("error");
        console.error(err);
      });

    return () => {
      closeRef.current?.();
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.connectionStatus) return;

    // When disconnected randomly, manually connect again
    if (state.connectionStatus === "disconnected") {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: { connectionStatus: "connected" },
      });
      closeRef.current = connect({
        afterSeq: lastAppliedSeqRef.current,
        onMessage,
        onOpen,
        onClose,
      }).close;
      return;
    }

    const intervalId = setInterval(() => {
      // Don't update state unnecessarily when there are no events to process
      if (batchedEventsRef.current.length === 0) {
        return;
      }

      dispatch({
        type: "BATCH_UPDATE_ROBOTS",
        payload: { events: batchedEventsRef.current },
      });

      batchedEventsRef.current = [];
    }, BATCH_UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      closeRef.current?.();
    };
  }, [state.connectionStatus]);

  useEffect(() => {
    lastAppliedSeqRef.current = state.lastAppliedSeq;
  }, [state.lastAppliedSeq]);

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
        <div className={styles["status-list"]}>
          <div>Seq: {state.lastAppliedSeq}</div>
          <div>Connection: {state.connectionStatus}</div>
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
        <div className={styles["row-list"]}>
          {Object.values(state.robots).map((robot) => {
            return <TableRow key={robot.id} robot={robot} />;
          })}
        </div>
      </div>
    </div>
  );
};
