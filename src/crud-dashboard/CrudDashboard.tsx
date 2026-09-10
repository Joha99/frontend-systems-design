/**
 * CRUD Dashboard (Products Manager)
 *
 * Build a product management dashboard with full CRUD operations,
 * optimistic updates, and error recovery.
 *
 * API:
 *   GET    https://dummyjson.com/products?limit=20&skip=0
 *   GET    https://dummyjson.com/products/:id
 *   POST   https://dummyjson.com/products/add       body: { title, price, category }
 *   PUT    https://dummyjson.com/products/:id        body: { title, price, category }
 *   DELETE https://dummyjson.com/products/:id
 *
 * Requirements:
 * 1. On mount, fetch the first 20 products. Display as cards showing:
 *    title, price, category, and thumbnail.
 * 2. "Add Product" button opens an inline form (not a modal). Fields:
 *    title (required), price (required, number), category (required).
 *    Validate before submit. POST to API, optimistically add to list.
 * 3. Each card has Edit and Delete buttons.
 *    - Edit: card becomes an inline edit form pre-filled with current values.
 *      Save PUTs to API with optimistic update. Cancel reverts.
 *    - Delete: confirm dialog, then DELETE with optimistic removal.
 * 4. Optimistic updates: update local state immediately, revert on API error.
 *    Show a toast/banner on error with the reverted item's name.
 * 5. Per-item loading state: show a spinner overlay on the card being
 *    edited/deleted while the API call is in flight.
 * 6. Debounced search: text input filters products by title. Debounce the
 *    filter by 300ms so it doesn't re-filter on every keystroke.
 *    Filter client-side against the loaded products.
 * 7. Infinite scroll: when user scrolls to bottom, fetch next 20 products
 *    (skip += 20). Stop when skip >= total.
 *
 * Key concepts: optimistic updates with rollback, per-item loading/error,
 * form validation, debounced filtering, infinite scroll.
 *
 * Time target: 35 minutes.
 */

import styles from "./CrudDashboard.module.css";

export const CrudDashboard = () => {
  // TODO: implement

  return <div>CRUD Dashboard</div>;
};
