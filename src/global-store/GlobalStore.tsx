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
 *    - notifications: { id: number, message: string }[]
 * 3. Build three separate components that consume the store:
 *    - ThemeToggle: button that dispatches TOGGLE_THEME, background changes accordingly.
 *    - UserPanel: shows user name + login/logout button (dispatches LOGIN / LOGOUT).
 *    - NotificationList: shows notifications, button to add one (ADD_NOTIFICATION),
 *      each notification has dismiss button (DISMISS_NOTIFICATION).
 * 4. All three components read from and dispatch to the same store.
 * 5. None of the components pass props to each other (all communication is through Context).
 *
 * Hints:
 * - Create the context, reducer, and provider in this file.
 * - Use useContext in each child component to access state and dispatch.
 * - This is the exact pattern Redux uses under the hood.
 *
 * Time target: 20 minutes.
 */

import styles from "./GlobalStore.module.css";

export const GlobalStore = () => {
  return <div>Global Store</div>;
};
