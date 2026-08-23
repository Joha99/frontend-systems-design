/**
 * Typeahead / Autocomplete
 *
 * Build a search component that fetches suggestions from an API as the user types.
 * API: GET https://dummyjson.com/products/search?q={query}
 * Response: { products: [{ id, title, price, category }, ...] }
 *
 * Requirements:
 * 1. Show an input field. As the user types, fetch matching products and display them in a dropdown.
 * 2. Debounce the API calls — don't fire a request on every keystroke.
 * 3. Show appropriate UI for loading, no results, and error states.
 * 4. When a user clicks a result, populate the input with that product's title and close the dropdown.
 *
 * Stretch:
 * - Keyboard navigation — arrow keys to move through results, Enter to select, Escape to close.
 * - Highlight the matching portion of text in each result.
 */

import { useEffect, useState, type ChangeEvent } from "react";

import styles from "./Typeahead.module.css";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
}

const DEBOUNCE_MS = 300;
const SEARCH_URL = "https://dummyjson.com/products/search";

export const Typeahead = () => {
  const [currentInput, setCurrentInput] = useState("");
  const [matchedItems, setMatchedItems] = useState<Product[]>([]);
  const [isItemSelected, setIsItemSelected] = useState(false);

  useEffect(() => {
    let timerId: number;
    const controller = new AbortController();

    if (currentInput && !isItemSelected) {
      timerId = setTimeout(async () => {
        try {
          const response = await fetch(
            `${SEARCH_URL}?q=${encodeURIComponent(currentInput)}`,
            { signal: controller.signal },
          );
          if (response.ok) {
            const data = await response.json();
            setMatchedItems(data.products);
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setMatchedItems([]);
        }
      }, DEBOUNCE_MS);
    } else {
      setMatchedItems([]);
    }

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [currentInput, isItemSelected]);

  const showDropdown = matchedItems.length > 0 && !isItemSelected;

  return (
    <div>
      <p>
        1. Build a search component that fetches suggestions from an API as the
        user types.
      </p>
      <input
        type="text"
        placeholder="Search for product"
        value={currentInput}
        className={styles.input}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setCurrentInput(event.target.value);
          setIsItemSelected(false);
        }}
      />
      {showDropdown && (
        <div className={styles.dropdown}>
          <ul className={styles.list}>
            {matchedItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentInput(item.title);
                    setIsItemSelected(true);
                  }}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
