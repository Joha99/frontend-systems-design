/**
 * Debounced Multi-Filter Panel
 *
 * Build a product listing with multiple filter controls that are all
 * debounced independently, with URL sync and AbortController.
 *
 * API: GET https://dummyjson.com/products/search?q=phone&limit=20&skip=0
 *      GET https://dummyjson.com/products/categories  (list of category strings)
 *
 * Requirements:
 * 1. On mount, fetch categories for the category dropdown, and fetch
 *    the first 20 products. Display as a grid of cards (title, price, thumbnail).
 * 2. Three filter controls:
 *    - Text search input (searches by product title via the search API)
 *    - Category dropdown (client-side filter on fetched results)
 *    - Price range: min/max number inputs (client-side filter)
 * 3. The text search input is debounced (300ms). Each keystroke resets
 *    the debounce timer. When it fires, fetch from the search API.
 *    Use AbortController to cancel in-flight requests when a new one starts.
 * 4. Category and price filters are also debounced (200ms) but filter
 *    client-side against the current product list (no new fetch).
 * 5. Show an "Active filters" summary: chips for each active filter
 *    (e.g. "Search: phone", "Category: laptops", "Price: $50-$200").
 *    Each chip has an X to clear that filter.
 * 6. "Clear all filters" button resets everything and re-fetches the
 *    default product list.
 * 7. Loading state: skeleton cards while fetching, disabled filter controls
 *    during fetch.
 * 8. "No results" state with a message suggesting to clear filters.
 *
 * Key concepts: multiple independent debounce timers, AbortController,
 * combining server-side and client-side filtering, cleanup on unmount.
 *
 * Time target: 30 minutes.
 */

import styles from "./DebouncedFilters.module.css";

export const DebouncedFilters = () => {
  // TODO: implement

  return <div>Debounced Filters</div>;
};
