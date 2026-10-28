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

## Chat / WhatsApp (Tue Oct 20, Hello Interview + follow-ups)

**Strong:** measurable requirements, client-generated id used for rendering + idempotency + dedupe, retries with the same key and backoff + jitter, a real WebSocket trade-off, debounced like toggles, "new messages ↓" pill.

1. **No real-time protocol in the API.** Listed REST endpoints only; no WebSocket events (`message.created`, `message.updated`, `typing`, `resume since=seq`) and no heartbeat.
   - _Next time:_ when you pick WebSocket, write its events next to the REST endpoints.
2. **Reconnect mixed up three things:** detecting the drop (close/offline/heartbeat), reconnecting (backoff + jitter, never give up), and catching up (`since=seq`, all event types, gap detection, "too far behind" → refetch). Unsent messages must be resent from the outbox.
3. **Data model put per-user and pagination state on shared entities** (`lastReadId`, `unreadMessagesCount`, `nextCursor`, `messageIds` on Chat), had `replies` lists on messages, and no `chatId`/`seq` on Message.
   - _Next time:_ entity = what the server stores for everyone; per-user state and loaded-list state live in separate client tables.
4. **REST shape:** message ids in request bodies (PATCH/DELETE `/chats/:id/messages`), DELETE with a body, "delete chat" pointing at a message path, read state mixed into "like".
   - _Next time:_ act on one item with `/messages/:id`; nest only to list or create.

## design/07 Figma (Wed Oct 21)

**Strong:** world vs screen coordinates, measurable 60fps/200ms targets, presence as ephemeral (throttled cursors, selection as ids, heartbeat, rooms), canvas vs DOM with real reasons, ops applied locally → ack (not echo), render-time virtualization, parentId + ordered children.

1. **Entity still nested + one shape for every type.** `children: Node[]` on Node while the store is normalized; text fields nullable on every node; `image` type missing; no `name` for the layers panel.
   - _Next time:_ entity = flat with `parentId` + order; per-type fields via a union on `type`.
2. **Real-time protocol only in prose again.** Events (join/snapshot, op, ack, presence, resume, ping) belong in the API section with shapes, plus a client op id for acks and safe resends.
3. **Undo history too thin:** only an inverse patch (redo needs the forward one), create/delete must store the whole node + parent + index, and one user action can touch many nodes (one stack entry = a group).
4. **Conflict rule not stated.** Say it: server orders ops, last write wins per property, keep your pending value until acked.

## design/05 collaborative doc (Fri Oct 23)

**Strong:** CRDT vs OT reasoning, SSE vs WebSocket, two-way sync on rejoin, DocumentMember, relative-position anchors, comment deep dive (drift, deleted text → quotedText, overlaps, sidebar layout + virtualization).

1. **Copied Figma's version-based pieces into a CRDT design** (`version`, `lastAppliedVersion`, ops with offsets, `too_far_behind`, per-property undo).
   - _Next time:_ CRDT = state vector + one opaque `update`; the library owns sync, pending text changes and undo.
2. **Two copies of the document** (blocks in the store + text in the CRDT).
   - _Next time:_ "would it print?" → inside the CRDT; everything else (comments, presence, roles, UI) → store.
3. **Prompt's Part 2 (comment anchors) wasn't a deep dive at first.** Always deep-dive what the prompt names explicitly.
4. **Requirements without design** (formatting, media, undo) and no V1 cut / empty components.

## Slack-style chat mock, live with Claude (Sat Oct 24)

**Strong:** one socket per user; per-channel seq for order + catch-up (edits/deletes get one, read state doesn't); client id + opId + outbox; unread derived from lastReadSeq on memberships + cross-tab `read`; reconnect = summaries for all channels, replay the open one, mark the rest stale; virtualization (estimate → measure → correct scroll, sliding window).

**Say these WITHOUT being asked next time:**
1. Ask about **scale and usage** (members, channels per user, message rate, devices/tabs), not just features.
2. Draw **data flow** first: components → store → sync layer (socket + HTTP + outbox) → server. Components never touch the network; reads = selectors, writes = actions.
3. Send flow up front: optimistic insert with client id + status, opId for acks/retries, outbox, offline = wait (not failed).
4. **Drafts ≠ outbox** (drafts: own table, debounced to IndexedDB; Send moves it to the outbox). **opId ≠ messageId** (request vs thing).
5. Summary: "decisions I'm proud of" = design decisions, not what I learned.

## Assort front-desk dashboard mock, live with Claude (Mon–Tue Oct 26–27)

**Strong:** clarifying questions (scale, assignment, offline, takeover meaning); discriminated unions for handler/speaker/booking status; `latestLine` preview on cards vs full lines only for the open call; REST action + socket news; subscribe/unsubscribe for the open call.

**Struggled with (data model):**
1. **Link direction.** Test: "can this field ever need more than one value?" One→many = parentId on the child; many↔many or extra pairing data = a table in the middle; user-chosen order = list on parent (V1) or `position` on a join row.
2. **Server entities vs loaded lists.** Never put what this tab loaded (`lineIds`, status) on a shared entity: a server update replaces it and wipes your list. Separate map keyed by parent id, with a status.
3. **Optimistic vs wait.** Contested actions (takeover, last seat, money) wait for the server; store a pending id in `ui`, never set the shared entity early.

**Struggled with (API):**
1. **Identity in the URL** (`/handler/:userId`): the client could impersonate anyone. Who = session cookie.
2. **Seq scope.** One counter per *stream*: per clinic (call started/ended/handler/booking) + per call transcript (lines only). The server stamps seqs and keeps a log; `lastAppliedVersion` is the client's bookmark. Every change (incl. partial-line updates) gets a new seq; seq ≠ display position ≠ cursor.
3. **Cursor vs seq.** Live views catch up with seq; cursors are only for paging big lists (call history).
4. **Reconnect mixing snapshot and replay.** Pick one: missed events (same shape as live) with a snapshot fallback, or always snapshot (V1).
5. **Status codes.** 400 = malformed request (client bug); state conflicts (slot taken, someone else won) = 409 with a machine code + current state; EHR down = 503 + retryable.
6. **Kept forgetting** the version on first load and `lastSeq` on the transcript load. Every snapshot returns the bookmark to resume from.
7. **Reconnect UI:** keep last data, dim + banner, disable contested actions. Never skeletons mid-shift.

**Struggled with (deep dives):**
1. **Takeover race:** "process one, then the other" isn't enough. The check + write must be atomic (compare-and-set: `UPDATE … WHERE handler_type = 'ai'`). Retry by the winner returns 200, not 409.
2. **Audio fails after the server said yes:** connect audio first, switch the handler after (warm transfer); the server times out and hands back to the AI, since a crashed tab never sends `release`.
3. **Gap on the transcript:** used the clinic stream by mistake. Gaps are per stream: hold the event, resume that call's stream after the last seq.
4. **Debounce for a live stream:** never fires while someone talks nonstop. Batch per animation frame + memoized rows.
5. **Memory:** size it out loud before cleaning up (200 calls × 100 lines ≈ 20k objects: fine). Clean up subscriptions; never the open call.

## Robot Fleet Part 1, coding (Tue–Wed Oct 27–28)

**Strong:** events into a ref, one dispatch per tick; connecting in the snapshot's `.then` with its seq (no seq in effect deps); reconnect in an effect, so unmount can't trigger it; a shared clock store + `useSyncExternalStore`; memo rows.

**Struggled with:**
1. **Async effect cleanup.** Cleanup ran before the fetch finished, so `close` didn't exist yet → StrictMode opened 2 sockets. Fix: a `cancelled` flag, checked **first** in `.then`/`.catch` (guard every state write, not just `connect`).
2. **Two copies of the same state** (`robotsRef` mirroring `state.robots`). The reducer is the one place that turns "old state + events" into new state; dispatch the events, not a precomputed map.
3. **Seq in effect deps** → reconnect every tick. Read the latest seq from a ref; deps = what should actually restart the effect.
4. **Reconnect replays buffered events.** Skip events with `seq <=` the **running** last-applied seq (not the value from before the batch).
5. **Accidental re-renders.** "Last seen" only ticked because empty batches re-rendered everything. Skip empty ticks; drive time on purpose with one shared clock.
6. **Derived state copied up via an effect** (`setIsStale` from the cell). `useSyncExternalStore` with a boolean `getSnapshot` (`() => isStale(lastSeenAt)`) re-renders the row only when it flips.
7. **Stale badge replaced the status.** Show both: "stale + error" ≠ "stale + idle".

## Dashboard failure modes + patient search box (Wed Oct 28)

**Failure modes, what to remember:**
1. **Offline:** never cover the screen. Keep last data, dim live parts, banner "Reconnecting… last updated 2:14", disable contested actions. On reconnect stay on the page, catch up, explain what changed ("The AI took over at 2:14").
2. **Detecting a drop:** each side detects from silence on its *receiving* end (server: no pongs; client: no pings/messages for ~2 intervals). Sends during an outage just sit in the buffer. The close tells you *that* it broke; the event log tells you *what* changed.
3. **Takeover race:** compare-and-set on the field that matters (`handler is still AI`), not a whole-object version (false conflicts). Loser gets 409 + current handler in the body; winner's retry gets 200.
4. **EHR rejects an edit:** the booking entity stays at the server's value ("still at 2:00 PM"); edit status lives in UI/form state. Re-enable Save on change, refetch availability. 409 (rejected) ≠ 503 (unreachable).
5. **Gaps:** hold, catch up, then sort + skip `seq <=` the *running* last-applied (handles duplicates without reasoning about timing). Snapshot comes with its seq. Keep events that arrive during the fetch. Don't show UI for sub-second gaps. Gaps are per stream.
6. **8-hour tab:** besides memory: session expiry (silent renew vs idle logout), deploys (stale bundle → "refresh" prompt), laptop sleep, background-tab throttling. Notice via heartbeat beacons, sampled heap, long tasks, soak tests.

**Patient search box:**
1. Requirements = *what*, not *how* ("use debouncing" is a solution). Name "results always match the current input" and privacy (no PHI in URLs → POST body).
2. Results are **ranked**: ordered ids + entities by id, never just a map. `{ ids, total }` per query.
3. **One copy:** results live in the query cache; the component reads `cache[debouncedQuery]`. Don't also keep them in component state.
4. Don't copy leftovers (seq, connectionStatus) from the last design: justify every piece of shared state for *this* feature.
5. **URL owns what should survive refresh/back/links** (the open patient id); don't mirror it in the store. Exception: sensitive text (search query) stays out of the URL on purpose.
6. `dob` = date-only string, never a `Date` (timezone shifts the day). Cache key normalized + org id; PHI cache in memory only, cleared on logout.
