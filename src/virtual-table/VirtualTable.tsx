/**
 * Virtualized Data Table
 *
 * Build a large data table with virtual scrolling, sortable columns,
 * and inline editing.
 *
 * API: GET https://dummyjson.com/users?limit=100&select=firstName,lastName,email,age,phone
 * Response: { users: [{ id, firstName, lastName, email, age, phone }] }
 *
 * Requirements:
 * 1. Fetch 100 users on mount. Render a table with columns:
 *    Name (firstName + lastName), Email, Age, Phone.
 * 2. Virtualize the table rows: only render ~15 visible rows based on scroll
 *    position. Each row has a fixed height (40px). The table body scrolls,
 *    the header stays fixed.
 * 3. Sortable columns: clicking a column header sorts ascending, clicking
 *    again sorts descending, third click removes sort. Show a sort indicator.
 *    Sort the full dataset, then virtualize the sorted result.
 * 4. Inline editing: double-clicking a cell turns it into an input. Enter
 *    commits the edit, Escape cancels. Tab moves to the next editable cell
 *    in the row. Only one cell editable at a time.
 * 5. Keyboard navigation: Arrow keys move a selected cell highlight through
 *    the visible table. The highlight scrolls the table when moving out of view.
 * 6. Show total row count and current scroll position: "Showing rows X-Y of Z".
 *
 * Key concepts: virtualization with a table layout, sorting a virtualized list,
 * inline editing with focus management, keyboard nav in a grid.
 *
 * Time target: 35 minutes.
 */

import styles from "./VirtualTable.module.css";

export const VirtualTable = () => {
  // TODO: implement

  return <div>Virtual Table</div>;
};
