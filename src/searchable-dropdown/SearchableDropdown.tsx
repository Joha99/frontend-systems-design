/**
 * Searchable Dropdown with Binary Search Index
 *
 * Build a dropdown component that efficiently searches a large sorted list
 * using a binary search range index instead of linear filtering.
 *
 * Requirements:
 * 1. Render a text input that, when focused, opens a dropdown list below it.
 * 2. The dropdown displays items from a pre-sorted list of 1000 names.
 *    Generate them: Array.from({ length: 1000 }, (_, i) => `User ${String(i).padStart(4, "0")}`)
 *    or fetch from https://dummyjson.com/users?limit=100&select=firstName,lastName
 *    and sort alphabetically by lastName.
 * 3. As the user types, filter the list to show only items whose name starts with
 *    the query (prefix match, case-insensitive). Do NOT use Array.filter for this.
 * 4. Instead, build a range index using binary search:
 *    - Binary search for the FIRST item >= query (lower bound)
 *    - Binary search for the LAST item < query + next char (upper bound)
 *    - Slice the sorted array between these two indices
 *    This is O(log n + k) where k is the number of matches, vs O(n) for filter.
 * 5. Show the count of matches: "Showing X of Y".
 * 6. Keyboard navigation: Arrow Up/Down moves highlight through visible items,
 *    Enter selects the highlighted item and closes the dropdown, Escape closes.
 * 7. Click outside closes the dropdown (useRef + document mousedown).
 * 8. Selected item fills the input. Clearing the input resets the selection.
 * 9. Virtualize the dropdown: only render the ~10 visible items based on scroll
 *    position, not all matches. Each item has a fixed height (e.g. 36px).
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./SearchableDropdown.module.css";

const ITEM_HEIGHT = 36;
const DROPDOWN_HEIGHT = ITEM_HEIGHT * 10;

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

const nextPrefix = (query: string) =>
  query.slice(0, -1) + String.fromCharCode(query.at(-1)!.charCodeAt(0) + 1);

const fullName = (user: User) => `${user.firstName} ${user.lastName}`;

export const SearchableDropdown = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number>();

  const dropdownContainer = useRef<HTMLDivElement>(null);
  const scrollableContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownContainer.current &&
        !dropdownContainer.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    fetch("https://dummyjson.com/users?limit=100&select=firstName,lastName")
      .then((res) => res.json())
      .then((json) => {
        const sortedUsers = [...json.users].sort((a: User, b: User) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()),
        );
        setUsers(sortedUsers);
      })
      .catch((err) => console.error(err));

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (focusedIndex === undefined) return;

    const list = inputValue !== "" ? filteredUsers : users;
    document.getElementById(String(list[focusedIndex].id))?.focus();
  }, [focusedIndex]);

  const lowerBound = (searchInput: string): number => {
    let lo = 0;
    let hi = users.length;

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const prefix = fullName(users[mid])
        .slice(0, searchInput.length)
        .toLowerCase();

      if (prefix.localeCompare(searchInput.toLowerCase()) < 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    return lo;
  };

  const getFilteredList = (input: string): User[] => {
    const start = lowerBound(input);
    const end = lowerBound(nextPrefix(input));
    return users.slice(start, end);
  };

  const selectUser = (user: User) => {
    setInputValue(fullName(user));
    setFilteredUsers([user]);
    setOpen(false);
  };

  const renderedList = inputValue !== "" ? filteredUsers : users;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT));
  const endIndex = Math.min(
    renderedList.length,
    Math.ceil((scrollTop + DROPDOWN_HEIGHT) / ITEM_HEIGHT),
  );

  const handleItemKeyDown = (e: KeyboardEvent, user: User, index: number) => {
    const actualIndex = startIndex + index;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (actualIndex >= renderedList.length - 1) return;

      if (actualIndex + 1 >= endIndex && scrollableContainer.current) {
        scrollableContainer.current.scrollTop = scrollTop + ITEM_HEIGHT;
        setScrollTop((prev) => prev + ITEM_HEIGHT);
      }
      setFocusedIndex(actualIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (actualIndex <= 0) return;

      if (actualIndex - 1 < startIndex && scrollableContainer.current) {
        scrollableContainer.current.scrollTop = scrollTop - ITEM_HEIGHT;
        setScrollTop((prev) => prev - ITEM_HEIGHT);
      }
      setFocusedIndex(actualIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectUser(user);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputValue("");
      setFilteredUsers([]);
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        ref={dropdownContainer}
        className={styles.searchableDropdownContainer}
      >
        {inputValue !== "" && (
          <p className={styles.label}>
            Showing {renderedList.length} of {users.length}
          </p>
        )}
        <input
          type="text"
          placeholder="Search for user"
          className={styles.anchor}
          onFocus={() => setOpen(true)}
          value={inputValue}
          onChange={(e) => {
            setScrollTop(0);
            setFocusedIndex(undefined);
            setInputValue(e.currentTarget.value);
            if (e.currentTarget.value !== "") {
              setFilteredUsers(getFilteredList(e.currentTarget.value));
            }
          }}
        />
        {open && renderedList.length > 0 && (
          <div
            ref={scrollableContainer}
            className={styles.dropdown}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <ul
              className={styles.list}
              style={{
                blockSize: ITEM_HEIGHT * renderedList.length,
                boxSizing: "border-box",
                paddingTop: ITEM_HEIGHT * startIndex,
              }}
            >
              {renderedList.slice(startIndex, endIndex).map((user, index) => (
                <li key={user.id} className={styles.listItem}>
                  <button
                    id={String(user.id)}
                    onClick={() => selectUser(user)}
                    onKeyDown={(e) => handleItemKeyDown(e, user, index)}
                  >
                    {fullName(user)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
