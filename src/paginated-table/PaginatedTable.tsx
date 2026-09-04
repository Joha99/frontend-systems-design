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
 */

import { useEffect, useState } from "react";
import "./PaginatedTable.css";

const TOTAL_USERS = 208;
const HEADERS = ["#", "Name", "Age", "Email", "Company"];

interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  company: string;
}

const parseUsers = (data: { users: (Omit<User, "company"> & { company: { name: string } })[] }): User[] =>
  data.users.map(({ company, ...rest }) => ({ ...rest, company: company.name }));

export const PaginatedTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const startRowNum = (page - 1) * limit + 1;
  const endRowNum = Math.min(TOTAL_USERS, page * limit);
  const lastPageNum = Math.ceil(TOTAL_USERS / limit);

  useEffect(() => {
    fetch(
      `https://dummyjson.com/users?limit=${limit}&skip=0&select=firstName,lastName,age,email,company`,
    )
      .then((res) => res.json())
      .then((data) => setUsers(parseUsers(data)));
  }, []);

  const handlePageChange = (newPage: number, newLimit?: number) => {
    const effectiveLimit = newLimit ?? limit;
    const skip = (newPage - 1) * effectiveLimit;

    fetch(
      `https://dummyjson.com/users?limit=${effectiveLimit}&skip=${skip}&select=firstName,lastName,age,email,company`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (newLimit) setLimit(newLimit);
        setUsers(parseUsers(data));
        setPage(newPage);
      });
  };

  return (
    <div>
      <p>
        Showing {startRowNum}-{endRowNum} of {TOTAL_USERS}
      </p>
      <table className="table">
        <thead>
          <tr>
            {HEADERS.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{startRowNum + index}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.age}</td>
              <td>{user.email}</td>
              <td>{user.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="paginationControls">
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
          ＜
        </button>
        <div>
          {Array.from({ length: 5 }, (_, index) => {
            let currPage;
            if (page <= 3) {
              currPage = index + 1;
            } else if (page >= lastPageNum - 2) {
              currPage = lastPageNum - 4 + index;
            } else {
              currPage = page - 2 + index;
            }

            return (
              <button
                key={currPage}
                className={page === currPage ? "selectedPage" : undefined}
                onClick={() => handlePageChange(currPage)}
              >
                {currPage}
              </button>
            );
          })}
        </div>
        <button disabled={page === lastPageNum} onClick={() => handlePageChange(page + 1)}>
          ＞
        </button>
        <label htmlFor="limit">Rows per page</label>
        <select id="limit" value={limit} onChange={(e) => handlePageChange(1, parseInt(e.target.value))}>
          {[10, 25, 50].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
