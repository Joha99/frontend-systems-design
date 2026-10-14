# Design: Extend an Existing System (Snooze, Send Later, Reminders)

**Time:** 45 min
**Why this one:** the Superhuman doc says the practical part may be "build a new system **or extend an existing system's features**", graded on separation of concerns, data flow, and extendability. This prompt is that format: you're handed an existing architecture and asked to add features without breaking it.
**Do first:** `02-email-client-superhuman.md` (this builds on its architecture).
**Related code in this repo:** `src/patterns/02-command-undo/`, `src/patterns/03-split-inbox-rules/`, `src/patterns/05-offline-outbox/`

## Prompt

> Here's our email client's current architecture (draw it from `02-email-client-superhuman.md`: views → keyboard registry → commands → local store → outbox/sync → API).
>
> Add three features:
> 1. **Snooze**: hide a thread until a chosen time, then bring it back to the top of the inbox.
> 2. **Send later**: schedule a message to send at a chosen time.
> 3. **Reminders**: "remind me if nobody replies in 3 days".
>
> Walk me through what you'd add and what you'd change. The less existing code you have to modify, the better.

## Clarifying questions to ask

- Must snoozed threads come back at the right time even if the app is closed? (Yes → the *server* owns the timer. The client can't.)
- Can the user see a "Snoozed" and "Scheduled" view? Edit or cancel?
- Time zones: the user snoozes "until tomorrow 9am" then flies to Tokyo. Which 9am?
- Does a reply to a snoozed thread un-snooze it?
- Should these work offline? (Snoozing offline: yes. The scheduled send must still go out if the laptop is closed → server.)

## What to produce

1. **What's new vs what's reused.** Aim for: new commands, new views, new server fields, **no changes** to the keyboard registry, outbox, or store mechanics.
   | Piece | New / changed / reused |
   | --- | --- |
   | `SnoozeCommand`, `SendLaterCommand`, `SetReminderCommand` | new (same command interface: `apply`, `invert`, `toMutation`) |
   | Keyboard registry | reused: just register `h` → snooze picker |
   | Outbox / sync | reused: new mutation types flow through unchanged |
   | Views | new `snoozed` and `scheduled` views, defined as **rules** (a filter + sort), not new components |
   | Thread model | changed: add `snoozedUntil?`, `remindAt?` |
   | Server | owns timers; emits `thread.unsnoozed` / `message.sent` / `reminder.fired` over the existing change stream |
2. **Data + API changes**:
   ```
   POST /api/mutations
     { id, type: "snooze", threadIds: ["t1"], until: "2026-10-20T09:00:00-04:00" }
     { id, type: "unsnooze", threadIds: ["t1"] }
     { id, type: "setReminder", threadId: "t1", remindAt: "...", condition: "noReply" }
   POST /api/messages/send     body: { …, sendAt: "2026-10-20T08:00:00-04:00" }
   PATCH /api/scheduled/:draftId   body: { sendAt } | DELETE /api/scheduled/:draftId
   ```
   Store times as absolute ISO timestamps with offset; the *picker* converts "tomorrow 9am" in the user's current zone.
3. **Flows**: draw the sequence for "press `h` → pick 'Tomorrow' → thread disappears → … next morning it reappears", including what happens if the laptop is closed the whole time.

## Deep dives the interviewer will push on

- **Where does the timer live?** The server. The client mirrors it optimistically: hide the thread now, trust the server's `thread.unsnoozed` event later. The client may *also* unhide locally at `snoozedUntil` if it's open, for snappiness. What if they disagree?
- **Undo:** "Undo" on snooze is just the inverse command. Undo on send-later = cancel the schedule. Undo after a scheduled send already went out: impossible; say so.
- **Inbox ordering:** an unsnoozed thread goes to the top. Is that by `lastMessageAt` (no) or by a new `surfacedAt`? Adding a sort key without changing every view → views as strategies.
- **Extensibility test:** next quarter PM wants "Snooze until I'm at my desk (location)". Which parts change? Ideally: one new trigger type on the server, one new option in the picker. If your answer touches the store or the outbox, the design is too coupled.
- **Separation of concerns:** where does "is this thread visible in the inbox right now?" live? (A pure selector: `isVisible(thread, now)`. Not inside a component.)

## Self-grading rubric

**Strong signals**
- Identifies the server as the owner of time-based behavior, and the client as an optimistic mirror.
- New features plug in as new commands, mutation types, and view rules; core layers unchanged.
- Time zones handled deliberately.
- Explains the extensibility test answer concretely.
- Draws the data flow, not just boxes.

**Weak signals**
- `setTimeout` in the browser as the snooze mechanism.
- New `if (thread.snoozed)` checks sprinkled across components.
- A new API endpoint per button with inconsistent shapes.
