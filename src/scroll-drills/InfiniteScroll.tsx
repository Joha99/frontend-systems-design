/**
 * Drill 1: Infinite scroll with a cursor (~30 min)
 *
 * Use fetchPosts() from ./mockApi.
 *
 * 1. Load the first page on mount. Show "Loading…" while waiting.
 * 2. When a sentinel <div> at the bottom comes into view
 *    (IntersectionObserver, not scroll events), load the next page.
 * 3. Never run two requests at once.
 * 4. When nextCursor is null, stop and show "You're all caught up".
 * 5. If a request fails, keep the posts you have and show a "Retry" button.
 * 6. Pages can overlap by one post: don't show duplicates (dedupe by id).
 *
 * Mount it: render <InfiniteScroll /> in src/App.tsx.
 */

import { fetchPosts, type Post } from "./mockApi";

export function InfiniteScroll() {
  void fetchPosts;
  const posts: Post[] = [];

  return (
    <div style={{ maxWidth: 400, margin: "24px auto" }}>
      <h2>Infinite scroll</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ padding: "24px 0", borderBottom: "1px solid #ddd" }}>
            {post.title}
          </li>
        ))}
      </ul>
      <p>TODO</p>
    </div>
  );
}
