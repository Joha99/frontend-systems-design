/**
 * Paginated Table with Server-Side Pagination
 *
 * Build a data table that fetches pages of data from an API on demand.
 * API: GET https://dummyjson.com/users?limit=10&skip=0&select=firstName,lastName,age,email,company
 * Response: { users: [...], total: 208, skip: 0, limit: 10 }
 *
 * Requirements:
 * 1. On mount, fetch the first page of users (limit=10, skip=0).
 * 2. Render a table with columns: #, Name (first + last), Age, Email, Company (company.name).
 * 3. Pagination controls at the bottom:
 *    - Prev / Next buttons (disabled at boundaries)
 *    - Page number buttons: show at most 5 page numbers centered around current page.
 *      e.g. if on page 7 of 21: [5] [6] [7] [8] [9]. On page 2: [1] [2] [3] [4] [5].
 *      On page 20 of 21: [17] [18] [19] [20] [21].
 *    - "Showing 11-20 of 208" text
 * 4. Clicking a page number fetches that page from the API (calculate skip from page number).
 * 5. Allow changing rows per page (10, 25, 50). Changing resets to page 1 and refetches.
 * 6. Loading state while fetching. Error state on failure.
 * 7. Sortable columns: clicking a column header sorts by that field. Use the API's
 *    sortBy and order params: ?sortBy=age&order=asc. Sorting resets to page 1.
 *
 * Math focus:
 * - skip = (page - 1) * limit
 * - totalPages = Math.ceil(total / limit)
 * - Page window: start = Math.max(1, current - 2), end = Math.min(totalPages, start + 4),
 *   then adjust start if end - start < 4
 * - "Showing X-Y of Z": X = skip + 1, Y = Math.min(skip + limit, total)
 *
 * Time target: 25 minutes.
 */

import "./PaginatedTable.css";

export const PaginatedTable = () => {
  return <div>Paginated Table</div>;
};
