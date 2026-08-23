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

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import styles from "./DataTable.module.css";

const ROWS_PER_PAGE = 10 as const;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  company: { name: string };
}

type Column = "name" | "age" | "email" | "company";
type SortOrder = "asc" | "desc";

const columnHeaders: Array<Column> = ["name", "age", "email", "company"];

export const DataTable = () => {
  const [users, setUsers] = useState<Array<User>>([]);
  const [sortedColumn, setSortedColumn] = useState<Column | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(null);
  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetch("https://dummyjson.com/users?limit=30")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      });
  }, []);

  const computedRows = useMemo(() => {
    // add filter logic
    const usersCopy = [...users];

    const filteredUsers = !filterValue
      ? usersCopy
      : usersCopy.filter((user: User) => {
          const lowerCaseFilterValue = filterValue.toLowerCase();

          return (
            user.firstName.toLowerCase().includes(lowerCaseFilterValue) ||
            user.lastName.toLowerCase().includes(lowerCaseFilterValue) ||
            user.email.toLowerCase().includes(lowerCaseFilterValue) ||
            user.company.name.toLowerCase().includes(lowerCaseFilterValue) ||
            String(user.age).includes(lowerCaseFilterValue)
          );
        });

    if (!sortedColumn || !sortOrder) {
      return filteredUsers;
    }

    // derive the new sorted rows from the filtered data
    const sortedUsers = filteredUsers.sort((a: User, b: User) => {
      const first = sortOrder === "asc" ? a : b;
      const second = sortOrder === "asc" ? b : a;

      if (sortedColumn === "age") {
        return first.age - second.age;
      } else if (sortedColumn === "name") {
        return first.firstName.localeCompare(second.firstName);
      } else if (sortedColumn === "company") {
        return first.company.name.localeCompare(second.company.name);
      } else {
        return first.email.localeCompare(second.email);
      }
    });

    return sortedUsers;
  }, [sortedColumn, sortOrder, users, filterValue]);

  const totalPages = Math.ceil(computedRows.length / ROWS_PER_PAGE);

  const onColumnClick = (selectedColumn: Column) => {
    setSortedColumn(selectedColumn);

    if (!sortedColumn || sortedColumn !== selectedColumn) {
      setSortOrder("asc");
    } else {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  const onFilter = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setFilterValue(event.currentTarget.value);
  };

  const isTableRendered = users.length > 0;

  return (
    <div>
      <p>2. Build a data table with sorting and filtering.</p>
      {isTableRendered && (
        <div className={styles.container}>
          <input
            type="text"
            placeholder="Search for users"
            value={filterValue}
            onChange={onFilter}
          />
          <table>
            <thead>
              <tr>
                {columnHeaders.map((header) => {
                  return (
                    <th key={header}>
                      <button
                        onClick={() => onColumnClick(header)}
                        className={styles.columnHeaderButton}
                      >
                        <span className={styles.columnHeaderText}>
                          {header}
                        </span>
                        {sortedColumn === header &&
                          (sortOrder === "asc" ? "🔼" : "🔽")}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {computedRows
                .slice(
                  (currentPage - 1) * ROWS_PER_PAGE,
                  (currentPage - 1) * ROWS_PER_PAGE + ROWS_PER_PAGE,
                )
                .map((user) => {
                  return (
                    <tr key={user.id}>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.age}</td>
                      <td>{user.email}</td>
                      <td>{user.company.name}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className={styles.paginationButtons}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={
                      pageNumber === currentPage ? styles.selected : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
};
