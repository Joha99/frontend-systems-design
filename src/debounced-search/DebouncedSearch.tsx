/**
 * Debounced Search with AbortController
 *
 * Build a search input that fetches results after the user stops typing,
 * and cancels in-flight requests when a new search starts.
 *
 * API: GET https://dummyjson.com/products/search?q={query}
 * Response: { products: [{ id, title, price, thumbnail }, ...] }
 *
 * Requirements:
 * 1. A search input that fetches results after 300ms of no typing (debounce).
 * 2. Display results as a list showing title and price.
 * 3. Cancel the previous fetch if the user types again before it resolves (AbortController).
 * 4. Show a loading indicator while a fetch is in flight.
 * 5. Show "No results" when the search returns an empty array.
 * 6. Clear results when the input is empty.
 * 7. Clean up the AbortController and timeout on unmount.
 *
 * Time target: 12 minutes.
 */

import { useEffect, useState } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

const DEBOUNCE_MS = 300;

export const DebouncedSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (inputValue === "") {
      setFetchedProducts([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      fetch(`https://dummyjson.com/products/search?q=${inputValue}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          setFetchedProducts(data.products);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error(error);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [inputValue]);

  return (
    <div>
      <h2>Debounced Search</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        placeholder="Search for a product"
      />
      {fetchedProducts.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {fetchedProducts.map((product) => (
            <li key={product.id}>
              {product.title} — ${product.price}
            </li>
          ))}
        </ul>
      ) : (
        inputValue !== "" && <p>No results.</p>
      )}
    </div>
  );
};
