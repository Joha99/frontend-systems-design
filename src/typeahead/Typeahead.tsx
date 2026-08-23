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
    <span>
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
    </span>
  );
};
