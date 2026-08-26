/**
 * Modify Existing Code — Post Browser
 *
 * This component fetches posts and lets users bookmark them.
 * It has BUGS and MISSING FEATURES. Your tasks:
 *
 * Bugs to find and fix (there are 5):
 * - Some are logic errors, some are React-specific mistakes.
 * - The component renders but several features don't work correctly.
 *
 * Features to add:
 * 1. Sort posts alphabetically by title (add a toggle button).
 * 2. Show a count: "Showing X of Y posts" that updates with filtering and tab switching.
 */

import { useEffect, useState } from "react";

import styles from "./PostBrowser.module.css";

interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  userId: number;
}

type Tab = "all" | "bookmarked";

export const PostBrowser = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [isAscending, setIsAscending] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    setFetchStatus("loading");
    fetch("https://dummyjson.com/posts?limit=15")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
        setFetchStatus("idle");
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || bookmarkedIds.has(post.id);
    return matchesSearch && matchesTab;
  });

  const filteredAndSortedPosts =
    isAscending !== undefined
      ? [...filteredPosts].sort((a, b) => {
          const first = isAscending ? a : b;
          const second = isAscending ? b : a;
          return first.title.localeCompare(second.title);
        })
      : filteredPosts;

  if (fetchStatus === "loading") return <p>Loading posts...</p>;
  if (fetchStatus === "error") return <p>Failed to load posts.</p>;

  return (
    <div className={styles.container}>
      <p>5. Fix bugs and add features to this post browser.</p>
      <p>
        Showing {filteredAndSortedPosts.length} of {posts.length} posts
      </p>
      <div className={styles.tabs}>
        <button
          className={activeTab === "all" ? styles.activeTab : ""}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={activeTab === "bookmarked" ? styles.activeTab : ""}
          onClick={() => setActiveTab("bookmarked")}
        >
          Bookmarked
        </button>
        <button
          onClick={() =>
            setIsAscending((prev) => {
              if (prev === undefined) return true;
              return !prev;
            })
          }
        >
          Sort {isAscending !== undefined && (isAscending ? "↑" : "↓")}
        </button>
      </div>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />
      <ul className={styles.list}>
        {filteredAndSortedPosts.map((post) => (
          <li key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <h3>{post.title}</h3>
              <button onClick={() => toggleBookmark(post.id)}>
                {bookmarkedIds.has(post.id) ? "★" : "☆"}
              </button>
            </div>
            <p>{post.body}</p>
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
