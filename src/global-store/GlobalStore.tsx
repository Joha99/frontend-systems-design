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
 *
 * Math focus:
 * - totalPages = Math.ceil(notifications.length / pageSize)
 * - visibleItems = notifications.slice((page - 1) * pageSize, page * pageSize)
 * - Edge case: current page > totalPages after deletion -> clamp to last page
 * - Edge case: adding pushes to a new page -> navigate there
 *
 * Hints:
 * - Create the context, reducer, and provider in this file.
 * - Use useContext in each child component to access state and dispatch.
 * - This is the exact pattern Redux uses under the hood.
 *
 * Time target: 25 minutes.
 */

import "./GlobalStore.css";

export const GlobalStore = () => {
  return <div>Global Store</div>;
};
