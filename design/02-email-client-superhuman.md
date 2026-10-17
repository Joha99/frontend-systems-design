# Design: A Keyboard-First, Offline-Capable Email Client

**Time:** 60 min (Part 1: 30 min, Part 2: 25 min)
**Why this one:** this is Superhuman's own product. If they don't ask it directly, the concepts (instant UI, keyboard-first, offline, undo) are what they care about.
**Related code in this repo:** `src/inbox-triage/` (Parts 1–3), `src/command-palette/`, `src/autosave-notes/`, `src/patterns/02-command-undo/`, `src/patterns/05-offline-outbox/`

## Prompt

> Design the frontend for a fast email client. Users live in it all day and mostly use the keyboard. Every action should feel instant, even on a bad connection.
>
> Core features: inbox list, reading pane, archive / mark read / label, compose and send, search.
>
> **Part 2:** The app must keep working offline (on a plane): read recent mail, triage, and write replies that send when the connection returns.

## Clarifying questions to ask

- Which provider(s)? Gmail only, or Gmail + Outlook? (Multiple → an adapter layer between providers and our model.)
- Is there our own backend between the client and Gmail, or does the client call Gmail directly? (Assume our own API that syncs with providers.)
- How big are mailboxes? (Assume 100k threads; the client can't hold them all.)
- Desktop app (Electron) or browser? (Decides storage limits and background sync.)
- "Instant": what's the target? (Assume every keyboard action reflects in < 50 ms; never block on the network.)
  -b Search: across all mail (server) or just what's loaded (client)?
- Multiple tabs / devices at once?

## Assumptions to use if the interviewer says "you decide"

|              |                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------- |
| Mailbox      | 100k threads; client keeps the most recent ~5k threads + bodies for the last 30 days locally |
| Platform     | Desktop web / Electron; IndexedDB available (hundreds of MB)                                 |
| Backend      | Our API syncs with Gmail/Outlook and exposes a uniform thread/message model                  |
| Real-time    | Server pushes changes over a WebSocket with a monotonically increasing `seq`                 |
| Latency goal | UI action < 50 ms; next-thread open < 100 ms (prefetched)                                    |

## What to produce

1. **Requirements**, with keyboard-first and "never wait on the network" stated as non-functional requirements.
2. **Architecture**, with these boxes at minimum:
   - **Views**: `ThreadList`, `ReadingPane`, `Composer`, `CommandPalette`, `UndoToast`.
   - **Keyboard layer**: a shortcut registry (`e` archive, `j/k` move, `r` reply, `cmd+k` palette) that maps keys → _commands_. It is context-aware (the composer swallows letters).
   - **Command layer**: every user action is a command object with `apply()` (local, instant) and `send()` (server), and an `invert()` for undo.
   - **Local store**: normalized threads/messages/labels in memory, persisted to IndexedDB.
   - **Sync engine**: the outbox queue (pending mutations) + the inbound change stream.
3. **Data model**:
   ```ts
   threads:  Record<ThreadId, { id, subject, snippet, participantIds, messageIds, labelIds, unread, lastMessageAt, version }>
   messages: Record<MessageId, { id, threadId, from, to, cc, sentAt, bodyRef, attachments }>
   views:    Record<ViewKey, { threadIds: ThreadId[]; cursor; stale: boolean }>  // "inbox", "label:work", "search:invoice"
   outbox:   PendingMutation[]   // { id, type, payload, attempts, createdAt }
   ui:       { focusedThreadId, selection: Set<ThreadId>, openThreadId, composerDrafts }
   ```
4. **API**:
   ```
   GET  /api/threads?view=inbox&cursor=…&limit=50   → { threads, nextCursor }
   GET  /api/threads/:id                             → { thread, messages }
   POST /api/mutations
        body: { mutations: [{ id: "m_81", type: "archive", threadIds: ["t1","t2"], baseVersion: 17 }] }
        → { results: [{ id: "m_81", status: "ok", version: 18 } | { id, status: "conflict", current: Thread }] }
   POST /api/messages/send
        Idempotency-Key: <draft id>
        body: { draftId, threadId?, to, cc, subject, bodyHtml, sendAt? }
   WS   /api/changes?since=<seq>   → { seq, type: "thread.updated" | "thread.created" | …, data }
   ```
   Why a batch mutations endpoint: archiving 30 threads is one request, and the outbox can flush many queued actions at once.

## Deep dives the interviewer will push on

- **"Instant" archive:** walk through pressing `e`: keyboard registry → `ArchiveCommand.apply()` updates the store → list re-renders, focus moves to the next thread → mutation goes to the outbox → outbox sends → server confirms. What does the user see if the server rejects it?
- **Undo:** the "Undo" toast after archive or send. For archive: apply the inverse command. For send: **delay the actual send** by ~5–10s and cancel locally. Why can't you "unsend" after the server sent it?
- **Prefetching:** how do you make opening the next thread take < 100 ms? (Prefetch bodies for the next N threads around the cursor; prefetch on hover.)
- **Long list:** 5k threads in the inbox. Virtualization with a keyboard cursor: how do you keep the focused row rendered and scrolled into view?
- **Selection + bulk actions:** `x` to select, shift+`j` to extend. Where does selection state live, and what happens to it when a selected thread is removed by sync?
- **Keyboard registry:** how do you prevent `e` from archiving while the user types an "e" in the composer? How do you show a cheat sheet (`?`) generated from the registry itself?
- **Search:** instant local search over cached threads (index subject/from/snippet) + server search for the rest; merge and dedupe results.

## Part 2: offline

- **Local source of truth:** the UI reads only from the local store. The network only _updates_ the store. That's what makes offline "free".
- **Outbox:** mutations persist to IndexedDB _before_ being applied, so a crash doesn't lose them. Replay in order on reconnect. Coalesce (archive then unarchive the same thread → drop both).
- **Sending offline:** the message shows in "Outbox" with a pending style. It sends on reconnect with its idempotency key, so a retry after a timeout can't double-send.
- **Conflicts:** you archived offline; meanwhile on your phone you labeled it. `baseVersion` lets the server detect it. Strategy: per-field merge for labels (set operations commute), last-write-wins for read state. Say what you'd show the user, if anything.
- **Catch-up:** on reconnect, open the change stream with `since=<last seq>`; if the server says the gap is too old, re-fetch the views instead.
- **Storage limits:** what do you evict, and when? (LRU by `lastMessageAt`, never evict unsent outbox items or drafts.)
- **Multiple tabs:** two tabs both flushing the outbox will double-send. Use one leader tab (Web Locks API / BroadcastChannel) or a SharedWorker for sync.

## Follow-ups

- Add "Remind me if no reply in 3 days" (see `06-extend-send-later-snooze.md`).
- Add a second provider (Outlook) with different label semantics (folders vs labels). Where does that difference get absorbed? (An adapter; see `src/patterns/04-mail-adapters/`.)
- How would you measure "feels instant"? (Time from keydown to next paint, tracked per command type.)

## Self-grading rubric

**Strong signals**

- Every action goes through one command layer (apply locally → queue → sync), which makes undo, offline, and shortcuts fall out naturally.
- The UI reads from the local store only; the network writes into it.
- Concrete outbox: persistence, ordering, coalescing, idempotency, retries with backoff.
- Has a conflict strategy and a catch-up strategy (sequence numbers).
- Keyboard handling is centralized and context-aware, not `onKeyDown` scattered across components.
- Undo-send explained correctly as a delayed send.

**Weak signals**

- Components call `fetch` directly and wait for responses.
- "Offline: use a service worker" with no data/sync design.
- Undo implemented as "call the server's undo endpoint".
- No answer for two tabs or two devices.
