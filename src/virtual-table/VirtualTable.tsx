/**
 * Virtualized Data Table (Systems Design)
 *
 * Build a large data table with virtual scrolling and sortable columns.
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
 * 4. Show total row count and current scroll position: "Showing rows X-Y of Z".
 *
 * Time target: 30 minutes.
 */

import styles from "./VirtualTable.module.css";

export const VirtualTable = () => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Virtualized Data Table</h2>
    </div>
  );
};
