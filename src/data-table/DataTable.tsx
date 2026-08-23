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

import { useEffect, useState } from "react";

import styles from "./DataTable.module.css";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  company: { name: string };
}

export const DataTable = () => {
  const [users, setUsers] = useState<Array<User>>([]);

  useEffect(() => {
    fetch("https://dummyjson.com/users?limit=30")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      });
  }, []);

  const isTableRendered = users.length > 0;

  return (
    <div>
      <p>2. Build a data table with sorting and filtering.</p>
      {isTableRendered && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Email</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
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
      )}
    </div>
  );
};
