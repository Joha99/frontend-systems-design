/**
 * Infinite Scroll Feed
 *
 * Build a feed that loads more items as the user scrolls to the bottom.
 * API: GET https://dummyjson.com/posts?limit=10&skip={offset}
 * Response: { posts: [{ id, title, body, tags, reactions }, ...], total, skip, limit }
 *
 * Requirements:
 * 1. On mount, fetch the first 10 posts and render them as cards (title, body preview, tags).
 * 2. When the user scrolls near the bottom of the list, fetch the next 10 posts and append them.
 * 3. Use IntersectionObserver to detect when the user reaches the bottom — do not use scroll events.
 * 4. Show a loading indicator at the bottom while fetching more posts.
 * 5. Stop fetching when all posts have been loaded (use `total` from the response).
 * 6. Show an error state if a fetch fails, with a "Retry" button.
 *
 * Stretch:
 * - Scroll-to-top button that appears after scrolling past the first page.
 * - Skeleton loading placeholders instead of a spinner.
 * - Remember scroll position if the user navigates away and comes back.
 */

import styles from "./InfiniteScroll.module.css";

export const InfiniteScroll = () => {
  return (
    <div>
      <p>7. Build an infinite scroll feed with IntersectionObserver.</p>
    </div>
  );
};
