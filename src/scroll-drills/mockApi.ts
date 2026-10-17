/** ✅ PROVIDED. A fake feed API with cursor pagination. */

export interface Post {
  id: string;
  title: string;
}

const ALL_POSTS: Post[] = Array.from({ length: 95 }, (_, i) => ({
  id: `p${i + 1}`,
  title: `Post #${i + 1}`,
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetchPosts({ cursor, limit }) → { posts, nextCursor }
 * - cursor: pass null for the first page, then the nextCursor you got back.
 * - nextCursor: null when there are no more posts.
 * - Fails about 1 in 5 times (rejects with an Error).
 * - Sometimes repeats the last post of the previous page (like a real ranked
 *   feed shifting between requests), so dedupe by id.
 */
export async function fetchPosts({
  cursor,
  limit = 10,
}: {
  cursor: string | null;
  limit?: number;
}): Promise<{ posts: Post[]; nextCursor: string | null }> {
  await wait(500 + Math.random() * 500);
  if (Math.random() < 0.2) throw new Error("Network error");

  const start = cursor ? Number(cursor) : 0;
  const overlap = start > 0 && Math.random() < 0.3 ? 1 : 0;
  const end = start + limit;
  return {
    posts: ALL_POSTS.slice(start - overlap, end),
    nextCursor: end < ALL_POSTS.length ? String(end) : null,
  };
}

/** 10,000 rows for the virtual list. */
export const ROWS: string[] = Array.from(
  { length: 10_000 },
  (_, i) => `Row ${i + 1}`,
);
