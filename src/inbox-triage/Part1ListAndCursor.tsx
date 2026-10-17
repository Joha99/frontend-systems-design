/**
 * Inbox Triage (Part 1 of 3): List, Pagination + Cursor
 *
 * Render the inbox and move through it with the keyboard.
 *
 * API: fetchThreads(cursor | null) → { threads, nextCursor }  (25 per page)
 *      setRead(ids, read) → always resolves
 *
 * Requirements:
 * 1. Load the first page on mount. Keep threads normalized (by id) plus an
 *    ordered array of ids.
 * 2. A single "cursor" row is outlined. j / k moves it down / up and
 *    scrolls it into view.
 * 3. When the cursor is within 5 rows of the end, fetch the next page.
 *    Never fetch the same page twice, and stop when nextCursor is null.
 * 4. Enter or o opens the cursor thread in a reading pane and marks it
 *    read (optimistically). u closes the pane and returns to the list with
 *    the cursor where it was.
 * 5. Unread threads are bold. Show sender, subject, snippet and time.
 *
 * Done when: holding j scrolls through all 120 threads, loading pages
 * along the way with no duplicates.
 *
 * Time target: 40 minutes.
 */

import { useEffect, useReducer, useRef, useState } from "react";
import styles from "./InboxTriage.module.css";
import { fetchThreads, setRead, type Thread, type ThreadPage } from "./mockApi";

type ThreadId = Thread["id"];
type FetchStatus = "loading" | "success" | "failure";

interface ListStates {
  ids: ThreadId[];
  threads: Record<ThreadId, Thread>;
  nextCursor: ThreadPage["nextCursor"];
  cursor: number;
  openThreadId: ThreadId | null;
}

type ListAction =
  | {
      type: "MOVE_UP";
    }
  | {
      type: "MOVE_DOWN";
    }
  | {
      type: "ADD_THREADS";
      payload: ThreadPage;
    }
  | {
      type: "OPEN_THREAD";
    }
  | {
      type: "CLOSE_THREAD";
    };

const reducer = (state: ListStates, action: ListAction) => {
  switch (action.type) {
    case "MOVE_UP": {
      if (!state.cursor) return state;

      return {
        ...state,
        cursor: state.cursor - 1,
      };
    }
    case "MOVE_DOWN": {
      if (state.cursor === state.ids.length - 1) return state;

      return {
        ...state,
        cursor: state.cursor + 1,
      };
    }
    case "ADD_THREADS": {
      const threads: ListStates["threads"] = { ...state.threads };
      const ids: ListStates["ids"] = [...state.ids];
      const nextCursor = action.payload.nextCursor;

      for (const thread of action.payload.threads) {
        if (!threads[thread.id]) {
          threads[thread.id] = thread;
          ids.push(thread.id);
        }
      }

      return {
        ...state,
        nextCursor,
        threads,
        ids,
      };
    }
    case "OPEN_THREAD": {
      if (state.cursor === null) return state;

      const openThreadId = state.ids[state.cursor];
      const threads = {
        ...state.threads,
      };
      threads[openThreadId] = {
        ...threads[openThreadId],
        read: true,
      };

      return {
        ...state,
        threads,
        openThreadId,
      };
    }
    case "CLOSE_THREAD": {
      return {
        ...state,
        openThreadId: null,
      };
    }
    default: {
      return state;
    }
  }
};

const getRelativeTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const Part1ListAndCursor = () => {
  const [state, dispatch] = useReducer(reducer, {
    ids: [],
    threads: {},
    nextCursor: null,
    cursor: 0,
    openThreadId: null,
  });

  const fetchStatusRef = useRef<FetchStatus>(null);
  const threadsRef = useRef<Record<number, HTMLDivElement>>({});

  useEffect(() => {
    let ignore = false;

    fetchStatusRef.current = "loading";
    fetchThreads(null)
      .then((data: ThreadPage) => {
        if (!ignore) {
          dispatch({ type: "ADD_THREADS", payload: data });
          fetchStatusRef.current = "success";
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          fetchStatusRef.current = "failure";
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j") {
        dispatch({ type: "MOVE_DOWN" });
      } else if (e.key === "k") {
        dispatch({ type: "MOVE_UP" });
      } else if (e.key === "o" || e.key === "Enter") {
        dispatch({ type: "OPEN_THREAD" });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    threadsRef.current[state.cursor]?.scrollIntoView({
      block: "nearest",
    });

    if (state.cursor > state.ids.length - 5) {
      console.log("fetching new posts");
      fetchNewPosts();
    }
  }, [state.cursor]);

  useEffect(() => {
    if (!state.openThreadId) return;
    setRead([state.openThreadId], true);
  }, [state.openThreadId]);

  const fetchNewPosts = () => {
    if (fetchStatusRef.current === "loading" || state.nextCursor === null)
      return;

    fetchStatusRef.current = "loading";
    fetchThreads(state.nextCursor)
      .then((data: ThreadPage) => {
        dispatch({ type: "ADD_THREADS", payload: data });
        fetchStatusRef.current = "success";
      })
      .catch((err) => {
        console.error(err);
        fetchStatusRef.current = "failure";
      });
  };

  const onCloseOpenThread = () => {
    dispatch({ type: "CLOSE_THREAD" });
  };

  const openThread = state.openThreadId
    ? state.threads[state.openThreadId]
    : undefined;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "30px",
      }}
    >
      <h2>Inbox Triage: Part 1</h2>
      <div className={styles.splitContainer}>
        <div className={styles.list}>
          <div className={styles.scrollable}>
            {state.ids.map((id, i) => {
              const thread = state.threads[id];
              const { sender, snippet, receivedAt } = thread;
              const formattedTime = getRelativeTime(receivedAt);

              const isCursorRow = i === state.cursor;
              const isRead = state.threads[thread.id].read === true;

              return (
                <div
                  key={id}
                  className={`${styles.thread} ${isRead ? styles.read : ""} ${isCursorRow ? styles.cursorRow : ""}`}
                  ref={(el) => {
                    if (el) {
                      threadsRef.current[i] = el;
                    }
                  }}
                >
                  <div>
                    ({id}) {sender}
                  </div>
                  <div>{snippet}</div>
                  <div>{formattedTime}</div>
                </div>
              );
            })}
          </div>
        </div>
        {openThread && (
          <div className={styles.openThreadPanel}>
            <header
              style={{
                borderBlockEnd: "1px solid #ccc",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>{openThread.subject}</h3>
                <button onClick={onCloseOpenThread}>🅧</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>{openThread.sender}</p>
                <p>{getRelativeTime(openThread.receivedAt)}</p>
              </div>
            </header>
            <div style={{ padding: "8px 12px" }}>{openThread.snippet}</div>
          </div>
        )}
      </div>
    </div>
  );
};
