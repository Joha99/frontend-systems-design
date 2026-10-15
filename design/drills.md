# FE System Design Drills (15 min each)

Short, focused reps for the gaps a full mock doesn't drill enough. Do one a day, out loud, with a timer. Pick from the section where `_my-notes.md` says you're weakest, or go in order.

Every drill ends the same way: say your answer in **under 2 minutes** as if the interviewer just asked. That's the skill.

---

## A. API design (write the actual JSON)

1. **Likes.** Endpoints for like/unlike a post and showing "Liked by Ann and 41 others". Request/response bodies. Why `PUT`/`DELETE` over `POST /toggle`?
2. **Comments with pagination.** List, create, reply, delete. Cursor or offset, and why? What's in the cursor?
3. **Draft autosave.** The client saves every few seconds. What does the request contain? How does the server reject an out-of-date save (versions)? What does the client do then?
4. **Search.** `GET /search?q=…`: response shape for grouped results ("People", "Messages"), highlighting, and pagination per group.
5. **Batch actions.** Archive 50 emails in one request. One endpoint or 50 calls? How are partial failures reported?
6. **Error envelope.** Design one error shape that every endpoint uses. Show a validation error, a not-found and a conflict.

## B. State shape

7. **Normalize this.** Take a nested API response (posts → author → comments → author) and write the normalized store: `byId`, id lists, and what's derived.
8. **Where does it live?** For an email client list: the thread list, the selected thread, the draft text, the unread count, the search query, the "compose open" flag, the user's settings. Server cache, URL, local state, global store, or `localStorage`? One reason each.
9. **Optimistic update, step by step.** Write the exact state before, during and after "archive" when the request fails. What do you store to roll back only that change?

## C. Data flow and real-time

10. **Draw the arrows.** For "user presses `e` to archive", draw the flow through keyboard → command → store → view → network → store. Label what travels on each arrow.
11. **Polling vs SSE vs WebSocket.** For each of: a notification badge, a chat app, a stock ticker, a "new posts" banner. Pick one and give the reason in a sentence.
12. **Reconnect.** The WebSocket drops for 30 s. What does the client do to get back to a correct state? (Backoff, resubscribe, catch up from a sequence number, dedupe.)

## D. Performance

13. **Long list.** 10,000 rows with variable height. Virtualize? How do you measure heights? What breaks (find-in-page, scroll restoration, a11y)?
14. **First load budget.** The app's first load is 4 s on a mid-range phone. List the 5 things you'd check first, in order, and the metric each one moves (LCP, INP, CLS).
15. **Images in a feed.** Avoid layout shift, pick sizes, lazy vs eager. Say it in under 2 minutes.

## E. Patterns and extensibility (OOP / SOLID)

16. **Spot the violation.** Describe a component you've seen that does too much. Which principle does it break? How would you split it?
17. **Add a feature without editing the core.** "Add a new kind of inbox view." Show how a registry/strategy makes that a new file instead of five edits.
18. **Undo.** Explain the Command pattern with your own inbox example, and why commands store "before" values instead of whole snapshots.
19. **Two providers.** How would you support Gmail and Outlook without `if (provider === "gmail")` everywhere?

## F. Trade-off pairs (say both sides, then pick)

20. SSR vs CSR for a logged-in app · normalized vs nested state · Context vs an external store · offset vs cursor pagination · optimistic vs pessimistic updates · local-first vs server-first. Do two pairs per drill.
