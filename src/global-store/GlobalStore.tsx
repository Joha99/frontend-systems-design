/**
 * Global Store (Redux-like pattern with useReducer + Context)
 *
 * Build a mini app with multiple components that share global state
 * using useReducer + React Context (the pattern Redux is built on).
 *
 * Requirements:
 * 1. Create a StoreProvider that wraps the app with Context, providing state and dispatch.
 * 2. The store manages:
 *    - theme: "light" | "dark"
 *    - user: { name: string, loggedIn: boolean }
 *    - notifications: { id: number, message: string, timestamp: number }[]
 * 3. Build three separate components that consume the store:
 *    - ThemeToggle: button that dispatches TOGGLE_THEME, background changes accordingly.
 *    - UserPanel: shows user name + login/logout button (dispatches LOGIN / LOGOUT).
 *    - NotificationList: shows notifications with pagination (5 per page), button to add
 *      one (ADD_NOTIFICATION), each notification has dismiss button (DISMISS_NOTIFICATION).
 *      Page controls: Prev / Next / "Page X of Y". Calculate total pages from notification
 *      count. When a dismissal removes the last item on the current page, drop back to
 *      the previous page. When a new notification is added, jump to the page it appears on.
 * 4. All three components read from and dispatch to the same store.
 * 5. None of the components pass props to each other (all communication is through Context).
 */

import { useState } from "react";
import "./GlobalStore.css";

import {
  StoreProvider,
  useStoreContext,
  useStoreSetterContext,
  type Notification,
} from "./StoreProvider";

const PAGE_SIZE = 5;

const ThemeToggle = () => {
  const { theme } = useStoreContext();
  const dispatch = useStoreSetterContext();

  return (
    <button
      className="themeToggle"
      onClick={() => dispatch({ type: "TOGGLE_THEME" })}
    >
      {theme === "light" ? "☀️" : "🌑"}
    </button>
  );
};

const UserPanel = () => {
  const { user } = useStoreContext();
  const dispatch = useStoreSetterContext();

  return (
    <div className="userPanel">
      {user.loggedIn ? (
        <>
          <div className="userName">{user.name}</div>
          <button className="logout" onClick={() => dispatch({ type: "LOGOUT" })}>
            logout
          </button>
        </>
      ) : (
        <button className="login" onClick={() => dispatch({ type: "LOGIN" })}>
          login
        </button>
      )}
    </div>
  );
};

const Notifications = () => {
  const [nextId, setNextId] = useState(20);
  const [page, setPage] = useState(1);
  const { user, notifications } = useStoreContext();
  const dispatch = useStoreSetterContext();

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const pageNotifications = notifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const addNotification = () => {
    const lastPageCount = notifications.length % PAGE_SIZE;
    setPage(lastPageCount === 0 ? totalPages + 1 : totalPages);

    dispatch({ type: "ADD_NOTIFICATION", id: nextId, timestamp: new Date() });
    setNextId((prev) => prev + 1);
  };

  const removeNotification = (id: Notification["id"]) => {
    if (page !== 1 && page === totalPages && pageNotifications.length === 1) {
      setPage((prev) => prev - 1);
    }
    dispatch({ type: "REMOVE_NOTIFICATION", id });
  };

  if (!user.loggedIn) {
    return (
      <div className="notifications">
        You must login to see your notifications.
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notifications">
        <span>There are no notifications.</span>
        <button onClick={addNotification}>Add notification</button>
      </div>
    );
  }

  return (
    <div className="notifications">
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <p style={{ padding: 0, margin: 0 }}>
          Page {page} of {totalPages}
        </p>
        <div>
          <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
            ＜
          </button>
          <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
            ＞
          </button>
        </div>
      </div>

      {pageNotifications.map(({ id, message }) => (
        <div key={id}>
          <span>{message}</span>
          <button onClick={() => removeNotification(id)}>🅧</button>
        </div>
      ))}
      <button onClick={addNotification}>Add notification</button>
    </div>
  );
};

export const GlobalStore = () => {
  return (
    <StoreProvider>
      <div className="app">
        <header className="appHeader">
          <h3>Global Store Problem</h3>
          <ThemeToggle />
        </header>
        <UserPanel />
        <Notifications />
      </div>
    </StoreProvider>
  );
};
