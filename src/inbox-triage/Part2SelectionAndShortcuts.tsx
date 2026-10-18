/**
 * Inbox Triage (Part 2 of 3): Selection, Search + Shortcut Map
 *
 * Start from your Part 1 code. Add multi-select and a proper shortcut system.
 *
 * Requirements:
 * 1. Build shortcuts as a MAP from key combo to handler, not an if/else
 *    chain. The ? overlay lists shortcuts generated from that same map.
 * 2. Selection is separate from the cursor:
 *    - x toggles selection of the cursor row (checkbox shown).
 *    - Shift+j / Shift+k extends the selection from an ANCHOR row to the
 *      new cursor row. Shift+click does the same with the mouse.
 *    - Escape clears the selection.
 * 3. / focuses a search box that filters loaded threads by sender or
 *    subject. j/k and range selection work on the FILTERED list.
 *    Escape in the search box blurs it.
 * 4. Shortcuts must NOT fire while typing in the search box.
 * 5. Accessibility: listbox (or grid) roles with aria-selected.
 *
 * Done when: you can search "github", select a range with Shift+j, and
 * clear it with Escape, all without the mouse.
 *
 * Time target: 45 minutes.
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
  checkedThreadIds: Set<ThreadId>;
  anchor: number | null;
  isSearching: boolean;
}

type ListAction =
  | {
      type: "MOVE_UP";
      payload: { toggled: boolean };
    }
  | {
      type: "MOVE_DOWN";
      payload: { toggled: boolean };
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
    }
  | { type: "TOGGLE_THREAD"; payload?: { id: Thread["id"] } }
  | { type: "CLEAR_SELECTION" }
  | {
      type: "SET_SEARCH";
      payload: { isSearching: boolean };
    };

const reducer = (state: ListStates, action: ListAction) => {
  switch (action.type) {
    case "MOVE_UP": {
      // no cursor movement or selection while a search is active
      if (state.isSearching || !state.cursor) return state;

      if (action.payload.toggled) {
        let anchor;
        let cursor;
        let checkedThreadIds;

        if (state.anchor !== null) {
          checkedThreadIds = new Set([...state.checkedThreadIds]);
          checkedThreadIds.delete(state.ids[state.cursor]);
          anchor = state.anchor;
          cursor = state.cursor - 1;
        } else {
          checkedThreadIds = new Set<string>([state.ids[state.cursor]]);
          anchor = state.cursor;
          cursor = state.cursor;
        }

        for (let i = cursor; i <= anchor; i++) {
          checkedThreadIds.add(state.ids[i]);
        }

        return {
          ...state,
          anchor,
          cursor,
          checkedThreadIds,
        };
      }

      return {
        ...state,
        cursor: state.cursor - 1,
      };
    }
    case "MOVE_DOWN": {
      if (state.isSearching || state.cursor === state.ids.length - 1)
        return state;

      if (action.payload.toggled) {
        let anchor;
        let cursor;
        let checkedThreadIds;
        if (state.anchor !== null) {
          checkedThreadIds = new Set([...state.checkedThreadIds]);
          checkedThreadIds.delete(state.ids[state.cursor]);
          anchor = state.anchor;
          cursor = state.cursor + 1;
        } else {
          checkedThreadIds = new Set<string>([state.ids[state.cursor]]);
          anchor = state.cursor;
          cursor = state.cursor;
        }

        for (let i = anchor; i <= cursor; i++) {
          checkedThreadIds.add(state.ids[i]);
        }

        return {
          ...state,
          anchor,
          cursor,
          checkedThreadIds,
        };
      }
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
      if (state.isSearching || state.ids.length === 0) return state;

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
    case "TOGGLE_THREAD": {
      // keyboard toggles (no id) are off during a search; checkbox clicks still work
      if (state.isSearching && !action.payload) return state;

      const toggledId = action.payload?.id ?? state.ids[state.cursor];

      if (state.checkedThreadIds.has(toggledId)) {
        const checkedThreadIds = new Set([...state.checkedThreadIds]);
        checkedThreadIds.delete(toggledId);

        return {
          ...state,
          checkedThreadIds,
          anchor: checkedThreadIds.size === 0 ? null : state.anchor,
        };
      }

      const anchor = action.payload?.id
        ? state.ids.indexOf(action.payload?.id)
        : state.cursor;

      return {
        ...state,
        anchor,
        checkedThreadIds: new Set([...state.checkedThreadIds, toggledId]),
      };
    }
    case "CLEAR_SELECTION": {
      if (state.isSearching) {
        return {
          ...state,
          isSearching: false,
        };
      }
      return {
        ...state,
        checkedThreadIds: new Set<string>(),
      };
    }
    case "SET_SEARCH": {
      return {
        ...state,
        isSearching: action.payload.isSearching,
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

const KEYBOARD_SHORTCUT: Record<string, ListAction> = {
  j: { type: "MOVE_DOWN", payload: { toggled: false } },
  J: { type: "MOVE_DOWN", payload: { toggled: true } },
  k: { type: "MOVE_UP", payload: { toggled: false } },
  K: { type: "MOVE_UP", payload: { toggled: true } },
  o: { type: "OPEN_THREAD" },
  Enter: { type: "OPEN_THREAD" },
  u: { type: "CLOSE_THREAD" },
  x: { type: "TOGGLE_THREAD" },
  Escape: { type: "CLEAR_SELECTION" },
  "/": { type: "SET_SEARCH", payload: { isSearching: true } },
};

export const Part2SelectionAndShortcuts = () => {
  const [state, dispatch] = useReducer(reducer, {
    ids: [],
    threads: {},
    nextCursor: null,
    cursor: 0,
    openThreadId: null,
    checkedThreadIds: new Set<ThreadId>(),
    anchor: null,
    isSearching: false,
  });

  const [searchValue, setSearchValue] = useState<string>("");

  const fetchStatusRef = useRef<FetchStatus>(null);
  const threadsRef = useRef<Record<number, HTMLDivElement>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredEmails = state.ids.filter((id) => {
    const thread = state.threads[id];
    const subject = thread.subject.toLowerCase();
    const sender = thread.sender.toLowerCase();
    const query = searchValue.toLowerCase();
    return subject.includes(query) || sender.includes(query);
  });

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
      const action = KEYBOARD_SHORTCUT[e.key];
      const fromSearchInput = e.target === searchInputRef.current;

      // Escape always works (it ends a search or clears the selection);
      // every other shortcut is ignored while typing in the search box.
      if (e.key === "Escape") {
        setSearchValue("");
        dispatch(action);
        return;
      }
      if (!action || fromSearchInput) return;

      if (e.key === "/") e.preventDefault(); // don't type the "/" into the box we're about to focus
      dispatch(action);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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

  // Only re-run when the cursor moves; fetchNewPosts guards itself with the loading ref.
  useEffect(() => {
    threadsRef.current[state.cursor]?.scrollIntoView({
      block: "nearest",
    });

    if (state.cursor > state.ids.length - 5) {
      fetchNewPosts();
    }
  }, [state.cursor]);

  useEffect(() => {
    if (!state.openThreadId) return;

    setRead([state.openThreadId], true);
  }, [state.openThreadId]);

  useEffect(() => {
    if (!searchInputRef.current) return;
    if (state.isSearching) {
      searchInputRef.current.focus();
    } else {
      searchInputRef.current.blur();
    }
  }, [state.isSearching]);

  const onCloseOpenThread = () => {
    dispatch({ type: "CLOSE_THREAD" });
  };

  const onCheckboxToggle = (id: Thread["id"]) => {
    dispatch({ type: "TOGGLE_THREAD", payload: { id } });
  };

  const openThread = state.openThreadId
    ? state.threads[state.openThreadId]
    : undefined;

  const renderedList = state.isSearching ? filteredEmails : state.ids;

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
      <h2>Inbox Triage: Part 2</h2>
      <div className={styles.splitContainer}>
        <div className={styles.list}>
          <div className={styles.toolbar}>
            <input
              type="text"
              placeholder="search"
              ref={searchInputRef}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.currentTarget.value);
              }}
            />
            <p>{renderedList.length} Emails</p>
          </div>
          <div className={styles.scrollable} role="listbox">
            {renderedList.map((id, i) => {
              const thread = state.threads[id];
              const { sender, snippet, receivedAt } = thread;
              const formattedTime = getRelativeTime(receivedAt);

              const isCursorRow = !state.isSearching && i === state.cursor;
              const isRead = state.threads[thread.id].read === true;
              const isChecked = state.checkedThreadIds.has(id);

              return (
                <div
                  role="option"
                  aria-selected={isChecked}
                  key={id}
                  className={`${styles.thread} ${isRead ? styles.read : ""} ${isCursorRow ? styles.cursorRow : ""}`}
                  ref={(el) => {
                    if (el) {
                      threadsRef.current[i] = el;
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onCheckboxToggle(id)}
                  />
                  <div>{sender}</div>
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
