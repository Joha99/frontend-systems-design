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
 * Hints:
 * - Create a new AbortController for each fetch.
 * - Pass controller.signal to fetch options.
 * - Call controller.abort() to cancel.
 * - In the catch, check if error.name === "AbortError" to ignore cancellations.
 *
 * Time target: 12 minutes.
 */

import styles from "./DebouncedSearch.module.css";

export const DebouncedSearch = () => {
  return <div>Debounced Search</div>;
};
