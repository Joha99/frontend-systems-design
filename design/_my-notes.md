# My design notes: weakest moments

Read this before every design rep. Fix these first.

## design/02 email client (Sun Oct 18, first draft)

**Rubric check:** strong on requirements breadth, a normalized store, `stale` lists, IndexedDB-first startup, idempotent send. Missed: a single command/action layer, undo, reconnect + catch-up, and a central keyboard registry.

1. **Optimistic updates without the details that matter.** "Revert to a previous state" instead of **targeted rollback** (undo only the failed change). No **undo** (undo archive = reverse action; undo send = delay ~5 s, then send). No answer for **rapid toggles** (send only the latest state per item). For Superhuman, this is the core of the product.
   - *Next time:* every action = one shared function: optimistic update → toast with Undo → outbox → per-item rollback on failure.
2. **Real-time with no failure story.** Picked WebSocket, but didn't say what happens when the connection drops: **reconnect with backoff + jitter, catch up with a sequence number (`since=`), dedupe by id**, and what the client does with a new email (normalize, insert at the top or show a notice). The WebSocket-vs-SSE reason was weak.
   - *Next time:* for any real-time choice, always cover: reconnect, catch-up, dedupe, where the event lands in the store.
3. **Data model mixed up "where it lives" with flags.** `mailbox: MailboxKey` on the Email mixed folder, starred and labels; stored an expiring `downloadLink`; missing `toIds`, `snippet`, the user's email and avatar; no `focusedEmailId`.
   - *Next time:* location = one `folder`; flags and tags = separate fields; never store expiring or derived data; check that every field the UI shows exists in the model.

**Also:** state the assumptions after the questions; make performance requirements **measurable** (under 100 ms per action); mention **XSS / sanitizing email HTML** for security; the API needed `PATCH` with partial bodies, a **batch** endpoint with per-item results, and drafts endpoints; add a keyboard-architecture deep dive.
