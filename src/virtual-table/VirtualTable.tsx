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
 *
 *
 * 3. Sortable columns: clicking a column header sorts ascending, clicking
 *    again sorts descending, third click removes sort. Show a sort indicator.
 *    Sort the full dataset, then virtualize the sorted result.
 * 4. Show total row count and current scroll position: "Showing rows X-Y of Z".
 *
 * Time target: 30 minutes.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./VirtualTable.module.css";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
}

const HEADERS = ["Name", "Email", "Age", "Phone"] as const;

export const VirtualTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      "https://dummyjson.com/users?limit=100&select=firstName,lastName,email,age,phone",
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUsers(data.users);
      });
  }, []);

  const firstRowIndex = Math.min(users.length - 15, Math.floor(scrollTop / 40));
  const lastRowIndex = Math.min(users.length, firstRowIndex + 15);

  console.log(`Rendered elements between [${firstRowIndex}, ${lastRowIndex}) `);

  return (
    <div style={{ width: "100%" }}>
      <h2>Virtualized Data Table</h2>
      {users.length > 0 && (
        <h4>
          Showing rows {firstRowIndex + 1} - {lastRowIndex} of {users.length}
        </h4>
      )}
      <div className={styles.table}>
        <div className={styles.header}>
          <div>#</div>
          {HEADERS.map((header) => {
            return <div key={header}>{header}</div>;
          })}
        </div>
        {users.length > 0 && (
          <div
            className={styles.body}
            ref={scrollContainer}
            onScroll={(e) => {
              const currScrollTop = Math.floor(e.currentTarget.scrollTop);
              setScrollTop(currScrollTop);
            }}
          >
            <div
              className={styles.virtualized}
              style={{ paddingTop: scrollTop }}
            >
              {users.slice(firstRowIndex, lastRowIndex).map((user) => {
                return (
                  <div key={user.id} className={styles.row}>
                    <div>{user.id}</div>
                    <div>
                      {user.firstName} {user.lastName}
                    </div>
                    <div>{user.email}</div>
                    <div>{user.age}</div>
                    <div>{user.phone}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
