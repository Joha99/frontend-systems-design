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

import { useEffect, useRef, useState } from "react";

import styles from "./InfiniteScroll.module.css";

const LIMIT = 10;

interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: { likes: number; dislikes: number };
}

export const InfiniteScroll = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchStatus, setFetchStatus] = useState<
    "loading" | "success" | "error" | undefined
  >(undefined);

  const totalPosts = useRef<number>(null);
  const totalFetchedPosts = useRef<number>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    setFetchStatus("loading");
    fetch(`https://dummyjson.com/posts?limit=${LIMIT}&skip=0`)
      .then((response) => response.json())
      .then((data) => {
        setFetchStatus("success");
        setPosts(data.posts);
        totalPosts.current = data.total;
        totalFetchedPosts.current = data.posts.length;
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  const fetchNewPosts = () => {
    const numPostsToFetch =
      totalPosts.current && totalFetchedPosts.current
        ? Math.min(totalPosts.current - totalFetchedPosts.current, LIMIT)
        : LIMIT;

    isFetching.current = true;
    setFetchStatus("loading");
    fetch(
      `https://dummyjson.com/posts?limit=${numPostsToFetch}&skip=${totalFetchedPosts.current}`,
    )
      .then((response) => response.json())
      .then((data) => {
        isFetching.current = false;
        setFetchStatus("success");
        setPosts((prev) => {
          const newPostsArray = [...prev, ...data.posts];
          totalFetchedPosts.current = newPostsArray.length;
          return newPostsArray;
        });
      })
      .catch(() => {
        isFetching.current = false;
        setFetchStatus("error");
      });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          totalPosts.current !== null &&
          totalFetchedPosts.current !== null &&
          totalFetchedPosts.current < totalPosts.current &&
          !isFetching.current
        ) {
          fetchNewPosts();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.9,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
      // if (sentinelRef.current) {
      //   observer.unobserve(sentinelRef.current);
      // }
    };
  }, [posts]);

  return (
    <div className={styles.cards}>
      {totalPosts.current !== null && (
        <p className={styles.counter}>
          Showing {totalFetchedPosts.current} of {totalPosts.current}
        </p>
      )}
      {posts.map((post) => (
        <div key={post.id} className={styles["post-card"]}>
          <div className={styles["post-title"]}>
            <h4>{post.title}</h4>
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div>{post.body}</div>
        </div>
      ))}
      {fetchStatus === "loading" && <p>Loading...</p>}
      {fetchStatus === "error" && <p>Issue with fetching new posts.</p>}
      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  );
};
