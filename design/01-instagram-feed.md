# Design: Instagram Frontend (Feed, Posts, Comments, Likes)

**Time:** 60 min (Part 1: 35 min, Part 2: 20 min)
**Named in the Superhuman prep doc.** Expect this one or something very close.
**Related code in this repo:** `src/virtual-feed/`, `src/infinite-scroll/`, `src/nested-comments/`, `src/lazy-images/`, `src/crud-dashboard/` (optimistic updates)

## Prompt

> Design the frontend architecture of Instagram's web app: the home feed, a post (image + caption), comments, and likes.
>
> **Part 2:** New posts from people you follow should show up while you're scrolling, without yanking the page out from under you. Extend the design.

## Clarifying questions to ask

- Web only, or also mobile web? Which screen sizes matter most?
- Is the feed ranked by the server, or chronological? (Ranked → the client can't merge pages itself.)
- Posts: single image only, or carousels and video? (Scope: say "single image + carousel, video later".)
- Comments: flat, or replies? How many comments shown inline vs on the post page?
- Do likes and comment counts need to be live, or is "updated on refresh" OK?
- Logged-in only? Is SEO needed for public profile/post pages?
- Expected scale: posts per session, image sizes?

## Assumptions to use if the interviewer says "you decide"

| | |
| --- | --- |
| Feed | Server-ranked, effectively infinite, ~10 posts per page |
| Session | User scrolls ~100 posts |
| Images | 1080px source; CDN serves 320/640/1080 widths |
| Comments | Feed shows the latest 2 + "View all 143 comments" → a post modal with paginated comments, 1 level of replies |
| Freshness | Like/comment counts can lag a few seconds; your own actions must show instantly |
| Rendering | Feed is behind login → CSR is fine. Public post pages get SSR for previews/SEO |

## What to produce

1. **Requirements**: functional (view feed, like, comment, view post, load more) and non-functional (fast first paint, smooth scroll on low-end phones, works on slow 3G, accessible).
2. **Component tree**: `App → FeedPage → FeedList → PostCard → (PostHeader, PostMedia, PostActions, CommentPreview, CommentComposer)`, `PostModal → CommentList → CommentItem`. Say which are containers (talk to the store) and which are presentational.
3. **Client state shape** (normalized):
   ```ts
   {
     users:    { byId: Record<UserId, User> },
     posts:    { byId: Record<PostId, Post> },          // Post.authorId, not an embedded User
     comments: { byId: Record<CommentId, Comment>, byPost: Record<PostId, { ids: CommentId[]; nextCursor: string | null }> },
     feed:     { ids: PostId[]; nextCursor: string | null; status: "idle" | "loading" | "error" },
     pendingLikes: Record<PostId, boolean>,               // optimistic layer
   }
   ```
   Explain why normalizing matters: the same post can be in the feed *and* the open modal, and a like must update both.
4. **API**:
   ```
   GET  /api/feed?cursor=abc&limit=10
        → { data: Post[], users: User[], nextCursor: "def" | null }
   GET  /api/posts/:id/comments?cursor=…&limit=20
        → { data: Comment[], users: User[], nextCursor }
   PUT    /api/posts/:id/like         → 204   (idempotent: liking twice = liked)
   DELETE /api/posts/:id/like         → 204
   POST /api/posts/:id/comments
        body: { clientId: "tmp_7f3", text: "nice!", parentId?: CommentId }
        → 201 { comment: Comment }
   Post: { id, authorId, media: [{ url, width, height, srcset, blurhash }], caption,
           likeCount, likedByMe, commentCount, createdAt, previewCommentIds }
   ```
   Why `PUT/DELETE` for like instead of `POST /toggle`: retries are safe and the final state is explicit.
5. **Deep dive on 2–3 of**: images, long-list performance, optimistic likes/comments, Part 2.

## Deep dives the interviewer will push on

- **Images:** how do you avoid layout shift while images load? (`width`/`height` from the API → `aspect-ratio` box, blurhash placeholder.) How do you pick the right size? (`srcset` + `sizes`.) What do you lazy load, and what do you load eagerly? (First 1–2 posts eager for LCP.)
- **Infinite scroll:** IntersectionObserver sentinel vs scroll events. When do you prefetch the next page? What happens if the user scrolls fast and two page requests fire?
- **100+ posts in the DOM:** do you virtualize? Variable heights make it hard. Trade-off: virtualization vs `content-visibility: auto` vs keeping DOM but unloading images offscreen.
- **Optimistic like:** tap like → count goes up instantly. The request fails. What exactly do you roll back? The user taps like/unlike 5 times fast: how many requests, and which one wins?
- **Optimistic comment:** temp id `tmp_7f3` shown with a "posting…" style. The server returns the real id. How do you swap it without re-mounting (and losing focus)? What if it fails?
- **Going back:** the user opens a post, then hits Back. Do they land at the same scroll position with the same posts? Where is the feed stored so that works?
- **Double-tap to like** on the image vs the like button: one action, two triggers. Where does that logic live?
- **Accessibility:** what's the accessible name of the like button? How is a new comment announced? Keyboard path through the feed?

## Part 2: new posts while scrolling

- How does the client learn about new posts? Poll `GET /api/feed/new?since=<cursor>` every 60s, SSE, or WebSocket? (For a feed, polling or SSE is usually enough. Say why WS is overkill here.)
- Never insert above the user's viewport. Buffer new posts and show a "↑ 5 new posts" pill. Clicking it scrolls to top and prepends.
- Dedupe: a buffered post may also arrive in the next page. Normalized `byId` makes merging safe.
- Tab hidden → stop polling (`visibilitychange`), catch up on return.

## Follow-ups

- Add Stories (a horizontal tray above the feed with its own viewer). What's shared with the feed and what's separate?
- Add offline support: the user opens the app on the subway. What do you show, and what happens to likes made offline?
- A ranked feed changes between page 1 and page 2 requests. How does the server's cursor design prevent duplicates or gaps?

## Self-grading rubric

**Strong signals**
- Normalized store, with a clear reason (shared entities across views).
- Concrete API with cursor pagination and real request/response JSON.
- Image strategy covers layout shift, responsive sizes, and lazy vs eager loading.
- Optimistic updates with targeted rollback and a story for rapid toggles.
- Part 2 never moves content under the user, and dedupes.
- Mentions measurable goals (LCP on the first image, INP on like taps, CLS ≈ 0).

**Weak signals**
- Each `PostCard` fetches its own data; no shared store.
- Offset pagination on a live feed without noticing duplicates.
- Likes wait for the server before updating.
- New posts auto-inserted at the top, shifting the page.
