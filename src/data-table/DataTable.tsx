/**
 * Data Table with Sorting and Filtering
 *
 * Fetch a list of users from this API:
 * API: GET https://dummyjson.com/users?limit=30
 * Response: { users: [{ id, firstName, lastName, age, email, company: { name } }, ...] }
 *
 * Requirements:
 * 1. Render users in a table with columns: Name (first + last), Age, Email, Company.
 * 2. Clicking a column header sorts by that column. Clicking again reverses direction. Show a sort indicator.
 * 3. Add a text input above the table that filters rows — any row where any visible column contains the search string should remain.
 * 4. Show appropriate UI when no rows match the filter.
 *
 * Stretch:
 * - Pagination — show 10 rows per page with previous/next controls.
 * - Make sort and filter work together (filter first, then sort the filtered results).
 */

import styles from "./DataTable.module.css";

export const DataTable = () => {
  return (
    <div>
      <p>2. Build a data table with sorting and filtering.</p>
    </div>
  );
};
