/**
 * Social Media Feed
 *
 * API: GET https://dummyjson.com/posts?limit=10&skip=0
 * Response: { posts: [{ id, title, body, tags, reactions: { likes, dislikes }, views, userId }], total }
 * Avatars: https://dummyjson.com/icon/<userId>/150
 *
 * Requirements:
 * 1. On mount, fetch the first 10 posts. Render cards showing:
 *    title, body (truncated to 2 lines with "Read more" toggle), tags as chips,
 *    like/dislike counts, view count, and user avatar.
 * 2. Infinite scroll: when user scrolls near the bottom, fetch the next 10 posts
 *    and append. Stop when all posts are loaded.
 * 3. "Read" tracking: detect when a post is 75% visible for 1+ second.
 *    Mark as read (dim styling). Show "X of Y read" counter.
 * 4. Scroll-to-top button: fixed bottom-right, appears when user scrolls
 *    past the 3rd post.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import styles from "./VirtualFeed.module.css";

interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
}

const Card = (
  props: Post & {
    cardsRef: RefObject<Record<number, HTMLDivElement>>;
    isRead: boolean;
  },
) => {
  const [expanded, setExpanded] = useState(false);

  const onExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      id={String(props.id)}
      className={`${styles.card} ${props.isRead ? styles.read : ""}`}
      ref={(e) => {
        if (e) {
          props.cardsRef.current[props.id] = e;
        }
      }}
    >
      <div className={styles.image}>
        <img
          src={`https://dummyjson.com/icon/${props.userId}/150`}
          alt={String(props.userId)}
        />
      </div>
      <div className={styles.content}>
        <header className={styles.header}>
          <h5>{props.title}</h5>
          {props.tags.map((tag) => (
            <span key={`${props.id}-${tag}`} className={styles.tag}>
              {tag}
            </span>
          ))}
        </header>
        <div>
          <p className={`${expanded ? "" : styles.body}`}>{props.body}</p>
          <button onClick={onExpand}>{expanded ? "read less" : "read more"}</button>
        </div>
        <div className={styles.footer}>
          <span>👍 ({props.reactions.likes})</span>
          <span>👎 ({props.reactions.dislikes})</span>
        </div>
      </div>
    </div>
  );
};

export const VirtualFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [read, setRead] = useState<Set<Post["id"]>>(new Set());
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Record<Post["id"], HTMLDivElement>>({});

  const renderedPosts = useRef<number>(0);
  const totalAvailablePosts = useRef<number>(0);
  const isFetching = useRef<boolean>(false);

  const fetchPosts = (skip: number) => {
    isFetching.current = true;
    fetch(`https://dummyjson.com/posts?limit=10&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) => [...prev, ...data.posts]);
        setTotal(data.total);

        renderedPosts.current += data.posts.length;
        totalAvailablePosts.current = data.total;
        isFetching.current = false;
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
        isFetching.current = false;
      });
  };

  useEffect(() => {
    const sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting && // sentinel is intersecting
          !isFetching.current && // and we are not already fetching more posts
          (renderedPosts.current === 0 ||
            renderedPosts.current < totalAvailablePosts.current)
        ) {
          fetchPosts(renderedPosts.current);
        }
      },
      {
        threshold: 0.1,
        root: scrollContainerRef.current,
      },
    );
    if (sentinelRef.current) {
      sentinelObserver.observe(sentinelRef.current);
    }
    return () => {
      sentinelObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const timeoutIds: Record<Post["id"], number> = {};

    const cardsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute("id");
          if (entry.isIntersecting) {
            timeoutIds[parseInt(cardId!)] = setTimeout(() => {
              setRead((prev) => new Set([...prev, parseInt(cardId!)]));
            }, 1000);
          } else {
            clearTimeout(timeoutIds[parseInt(cardId!)]);
          }
        });
      },
      {
        threshold: 0.75,
        root: scrollContainerRef.current,
      },
    );

    const thirdCardObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowScrollToTop(false);
        } else {
          setShowScrollToTop(true);
        }
      },
      { threshold: 1, root: scrollContainerRef.current },
    );

    if (posts.length > 0) {
      Object.values(cardsRef.current).forEach((ref) =>
        cardsObserver.observe(ref),
      );

      thirdCardObserver.observe(cardsRef.current[posts[2].id]);
    }

    return () => {
      cardsObserver.disconnect();
      thirdCardObserver.disconnect();
      Object.values(timeoutIds).forEach((id) => clearTimeout(id));
    };
  }, [posts]);

  return (
    <div className={styles.container}>
      <h2>Social Media Feed</h2>
      {showScrollToTop && (
        <button
          className={styles.topButton}
          onClick={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }
          }}
        >
          ⬆ Go to the top
        </button>
      )}
      <p>
        Showing {posts.length} of {total}
      </p>
      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        {posts.map((post) => {
          const isRead = read.has(post.id);

          return (
            <Card {...post} key={post.id} cardsRef={cardsRef} isRead={isRead} />
          );
        })}
        <div ref={sentinelRef} className={styles.sentinel}></div>
      </div>
    </div>
  );
};
