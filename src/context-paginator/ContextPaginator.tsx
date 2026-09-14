/**
 * Context-Driven Paginated List
 *
 * Tesla has asked about "API call with Pagination and using React Context."
 * Build a multi-component app where pagination state and data fetching
 * are managed via React Context, not prop drilling.
 *
 * Requirements:
 * 1. Create a PaginationContext with:
 *    - items: the current page of items
 *    - page, totalPages, isLoading, error
 *    - goToPage(n), nextPage(), prevPage()
 * 2. PaginationProvider fetches data when page changes.
 * 3. Three consumer components (no props passed between them):
 *    - <ItemList />   — renders the current page of items
 *    - <PageControls /> — Previous / Next / page input + total
 *    - <StatusBar />  — shows "Loading...", error, or "Page X of Y"
 * 4. Use a mock API:
 *    const fetchPage = async (page: number) => {
 *      await new Promise(r => setTimeout(r, 400));
 *      const pageSize = 5;
 *      const total = 47;
 *      const items = Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, (_, i) => ({
 *        id: (page - 1) * pageSize + i + 1,
 *        name: `Item ${(page - 1) * pageSize + i + 1}`,
 *      }));
 *      return { items, total, pageSize };
 *    };
 * 5. Handle edge cases: disable buttons at boundaries, show error
 *    with retry.
 *
 * Concept focus:
 * - When to use Context vs. props vs. state management libraries.
 * - Avoiding unnecessary re-renders (split contexts or useMemo).
 * - Provider pattern for encapsulating data-fetching logic.
 *
 * Time target: 25 minutes.
 */

import styles from "./ContextPaginator.module.css";

export const ContextPaginator = () => {
  return <div>Context Paginated List</div>;
};
