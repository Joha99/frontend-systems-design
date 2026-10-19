# My design notes: weakest moments

Read this before every design rep. Fix these first.

## design/02 email client (Sun Oct 18, first draft)

**Rubric check:** strong on requirements breadth, a normalized store, `stale` lists, IndexedDB-first startup, idempotent send. Missed: a single command/action layer, undo, reconnect + catch-up, and a central keyboard registry.

1. **Optimistic updates without the details that matter.** "Revert to a previous state" instead of **targeted rollback** (undo only the failed change). No **undo** (undo archive = reverse action; undo send = delay ~5 s, then send). No answer for **rapid toggles** (send only the latest state per item). For Superhuman, this is the core of the product.
2. **Real-time with no failure story.** Picked WebSocket, but didn't say what happens when the connection drops: **reconnect with backoff + jitter, catch up with a sequence number (`since=`), dedupe by id**, and what the client does with a new email (normalize, insert at the top or show a notice). The WebSocket-vs-SSE reason was weak.
   - _Next time:_ for any real-time choice, always cover: reconnect, catch-up, dedupe, where the event lands in the store.
3. **Data model mixed up "where it lives" with flags.** `mailbox: MailboxKey` on the Email mixed folder, starred and labels; stored an expiring `downloadLink`; missing `toIds`, `snippet`, the user's email and avatar; no `focusedEmailId`.
   - _Next time:_ location = one `folder`; flags and tags = separate fields; never store expiring or derived data; check that every field the UI shows exists in the model.

**Also:** state the assumptions after the questions; make performance requirements **measurable** (under 100 ms per action); mention **XSS / sanitizing email HTML** for security; the API needed `PATCH` with partial bodies, a **batch** endpoint with per-item results, and drafts endpoints; add a keyboard-architecture deep dive.

## design/06 snooze / send later / reminders (Sun Oct 18 draft, reviewed Mon Oct 19)

**Strong:** server owns time (with the "never rely on the client's clock or power state" rule), drafts reused for send later, the undo logic (remove from the outbox, or send the reverse PATCH), the reconnect checklist.

1. **Misread a feature.** Built "remind me if no reply" as a render-time label on every inbox item. It's an opt-in reminder on a message _you sent_ that brings the thread back to the top if nobody replied.
   - _Next time:_ say what the user sees in one sentence and confirm it before designing.
2. **The 02 data-model mistakes came back.** `snoozed` + `snoozedUntil` (derivable), `mode: scheduled` (overloads mode), required `attachments`, no sort key for "back to the top", and the client filtering a paginated list.
   - _Next time:_ drop a field the client can always compute from data it always has (summary fields like `hasAttachments` are fine); new views = new `MailboxKey` the server serves.
3. **API again: PUT instead of PATCH, no batch, scheduling through autosave.**
   - _Next time:_ PATCH for partial updates; bulk goes through the batch endpoint; one endpoint per kind of state (schedule ≠ autosave) so requests can't overwrite each other.
4. **Mixed up flows:** snooze wake-up "sent via the email provider"; the "app open at 9:00" case answered with a refetch instead of a pushed event.
   - _Next time:_ cover both "open" (push → store → re-render, focus by id) and "closed" (reconnect: backoff + jitter, `since=seq`, dedupe, flush the outbox).

**Also:** "Tomorrow 9am" is calendar math (local date at 09:00 → UTC), not "now + N ms"; answer "what does the user see" before the backend mechanism.

## Ideas from videos

1. data entities like (email) Draft or Message should have properties that track status (whether that be savedStatus or sendStatus)
   - this is needed to show the correct loading and error states to the user
2. when designing API endpoints, create separate endpoints if sending more than one at the same time could potentially overwrite the most up to date state with a outdated state
3.
