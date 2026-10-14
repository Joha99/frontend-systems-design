# Design: Real-Time Chat (Slack / Messenger-style)

**Time:** 60 min (Part 1: 35 min, Part 2: 20 min)
**Related code in this repo:** `src/chat/` (polling version), `src/virtual-feed/`, `graphql-websockets-practice/` (exercises 03–05: raw WS, reconnect, subscriptions)

## Prompt

> Design the frontend for a chat app: a list of conversations, a message thread, sending messages, typing indicators, and unread counts.
>
> **Part 2:** Users scroll back through years of history in busy channels. Make that fast, and make sure no messages are lost or duplicated when the connection drops.

## Clarifying questions to ask

- 1:1 only, or group channels? How many members in the biggest channel?
- Message types: text only, or images/files/reactions/threads?
- Do we need delivery/read receipts?
- Message editing and deletion?
- Ordering: does the server assign the order, or the client's timestamp? (Server, always. Client clocks lie.)
- Multiple devices signed in at once?

## Assumptions to use if the interviewer says "you decide"

| | |
| --- | --- |
| Conversations | ~200 per user, channels up to 5,000 members |
| Messages | Busy channel: 10 msg/s at peak; history: millions |
| Features | Text + reactions + edits; typing indicators; unread counts |
| Transport | One WebSocket per client, multiplexing all conversations |

## What to produce

1. **Requirements**, including "messages appear instantly when I send them" and "never lose a message".
2. **Architecture**: `ConversationList`, `MessageThread` (virtualized), `Composer`, `TypingIndicator`; a **socket manager** (one connection, subscriptions per conversation, reconnect); a **message store**; a **send queue**.
3. **Data model**:
   ```ts
   conversations: Record<ConvId, { id, name, memberIds, lastMessageId, unreadCount, lastReadSeq }>
   messages:      Record<MsgId, { id, clientId, convId, authorId, text, seq, createdAt, editedAt, status: "sending" | "sent" | "failed" }>
   threads:       Record<ConvId, { ids: MsgId[]; hasOlder: boolean; hasNewer: boolean; oldestSeq; newestSeq }>
   typing:        Record<ConvId, Record<UserId, expiresAt>>
   ```
4. **API**:
   ```
   GET  /api/conversations                               → { data: Conversation[] }
   GET  /api/conversations/:id/messages?before=<seq>&limit=50
                                                          → { data: Message[], hasMore }
   POST /api/conversations/:id/messages
        body: { clientId: "c_9a1", text }                → 201 { message }  (dedupe on clientId)
   POST /api/conversations/:id/read   body: { seq }      → 204

   WebSocket frames (server → client):
     { type: "message.created", convId, message }       // message.seq is per-conversation, gapless
     { type: "message.updated", convId, message }
     { type: "typing", convId, userId }
   Client → server:
     { type: "subscribe", convIds: [...] }
     { type: "typing", convId }
   ```

## Deep dives the interviewer will push on

- **Sending:** show the message instantly with `status: "sending"` and a client id. The server echoes it over the socket *and* returns it from POST. How do you avoid showing it twice? (Match on `clientId`.) Failure → "Failed, tap to retry".
- **Ordering:** two messages are sent at the same moment by different users. Who decides the order? (Server-assigned `seq`.) Your optimistic message has no `seq` yet: where do you render it? (At the bottom, then re-sort on ack.)
- **Gap detection:** you have seq 41, and the next socket event is seq 44. What do you do? (Fetch `?after=41` to fill the gap before rendering 44.)
- **Reconnect:** exponential backoff with jitter, resubscribe, then fetch missed messages per open conversation since `newestSeq`.
- **Scroll behavior:** new message arrives. If the user is at the bottom, stick to the bottom. If they're reading history, don't move; show "↓ 3 new messages".
- **Loading older messages:** prepend 50 messages above the viewport without the visible content jumping. (Measure scrollHeight before/after and adjust scrollTop, or use `overflow-anchor`.)
- **Unread counts:** derived from `lastReadSeq` vs the conversation's latest seq. When do you mark as read? (Visible + window focused.)
- **Typing indicators:** throttle outbound "typing" events (one per 3s), expire inbound ones after 5s with no refresh.

## Part 2: history + reliability

- Virtualized thread with variable-height rows (measure and cache heights per message id).
- Windowed loading: keep a few hundred messages in memory per conversation and drop the far end when the user jumps around. Jump to a date / a search result → load a window around that seq (`?around=<seq>`).
- Cache the last N messages per conversation in IndexedDB for instant open.
- No loss or duplicates: gapless `seq` per conversation + idempotent sends via `clientId` + dedupe by id when merging socket and HTTP results.

## Follow-ups

- Threads/replies (Slack-style): a side panel with its own message list. What's shared?
- Reactions arrive at 50/s on a viral message. How do you avoid re-rendering the whole thread?
- End-to-end encryption: what changes for search and push notifications?

## Self-grading rubric

**Strong signals**
- Server-assigned ordering with gap detection; client ids for dedupe.
- A real reconnect story: backoff, resubscribe, catch up.
- Scroll anchoring for both new messages and older history.
- One socket for all conversations; subscription management.
- Virtualization with measured heights.

**Weak signals**
- Ordering by client timestamps.
- Duplicated optimistic messages.
- Reconnect = "reload the page".
- Polling every second for every conversation.
