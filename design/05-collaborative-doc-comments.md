# Design: Collaborative Document with Comments (Google Docs / Notion-style)

**Time:** 60 min (Part 1: 30 min, Part 2: 25 min)
**Related code in this repo:** `src/outliner/`, `src/autosave-notes/`, `src/mention-composer/`, `src/undo-redo/`

## Prompt

> Design the frontend for a document editor where several people edit at once and leave comments anchored to text ranges.
>
> **Part 2:** Two people edit the same paragraph at the same time. Design how the client handles that, and how comments stay attached to the right text.

## Clarifying questions to ask

- Rich text (bold, headings, lists) or plain text? Embeds (images, tables)?
- How many concurrent editors? (Assume up to ~20.)
- Must it work offline and merge later?
- Comments: threads, resolve/reopen, @mentions, notifications?
- Version history?
- Are we building the editor engine, or using one (ProseMirror, Lexical, Slate)? (Say you'd use one and focus on the architecture around it, unless they want the internals.)

## What to produce

1. **Architecture**:
   - **Document model** (a block tree: `{ id, type, children | text, marks }`), separate from the DOM.
   - **Editor view** renders the model; user input becomes **operations** (`insertText`, `deleteRange`, `setBlockType`), never direct DOM edits.
   - **Collaboration layer**: sends local ops, receives remote ops, transforms/merges them.
   - **Presence**: other users' cursors and selections.
   - **Comments panel**: threads positioned next to their anchor in the document.
2. **Data model**:
   ```ts
   doc:       { id, version, root: BlockId, blocks: Record<BlockId, Block> }
   pending:   Op[]                       // sent but not acknowledged
   presence:  Record<UserId, { name, color, selection: Range | null, lastSeen }>
   comments:  Record<ThreadId, { id, anchor: Anchor, resolved, messages: Comment[] }>
   ```
3. **API / protocol**:
   ```
   GET /api/docs/:id                       → { doc, version, comments }
   WS  /api/docs/:id/live
       client → { type: "ops", baseVersion: 41, ops: [...], clientId }
       server → { type: "ack", version: 42 } | { type: "ops", version: 42, ops, author }
       client ↔ { type: "presence", selection }
   POST /api/docs/:id/comments
       body: { clientId, anchor: { blockId, start, end, quote: "the selected text" }, text }
   ```

## Deep dives the interviewer will push on

- **Concurrent edits:** OT (operational transformation, server-ordered, used by Google Docs) vs CRDT (Yjs/Automerge, merges without a central order, great for offline). Know one sentence on how each works and which you'd pick: **CRDT via Yjs** if offline matters, else OT or a server-authoritative op log.
- **Local responsiveness:** apply ops locally immediately; keep them in `pending`; rebase pending ops when remote ops arrive.
- **Comment anchors:** a comment on "quarterly revenue" must survive edits *before* it, and handle deletion *of* it. Anchor to positions that move with edits (relative positions / CRDT ids), and keep the `quote` to detect "the original text was deleted" (show as orphaned).
- **Positioning comments in the sidebar:** each thread aligns with its anchor; overlapping threads stack; the active thread gets priority. Recompute on scroll/resize/edit (measure anchor rects, batch in `requestAnimationFrame`).
- **Undo:** undo should only undo *my* changes, not a collaborator's. (Per-user undo stack of inverted ops, transformed against later remote ops.)
- **Presence:** throttle cursor broadcasts (~every 50–100ms), expire stale users, assign colors deterministically.
- **Performance on long docs:** don't re-render the whole document per keystroke; blocks are memoized by id; virtualize very long docs.

## Part 2: same-paragraph conflict

Walk through a concrete example. Text: `"Hello world"`. Alice inserts `"big "` at 6. Bob deletes `"world"` (6–11) at the same time. Show what each client sees before and after the merge, and the final text.

## Follow-ups

- Version history with "restore this version". Snapshot every N ops + store the op log.
- Permissions: a viewer can comment but not edit. Where is that enforced? (Server, always; the client only hides UI.)
- Suggestions mode (tracked changes).

## Self-grading rubric

**Strong signals**
- The document is a model, edits are ops, the view is derived.
- Names OT vs CRDT correctly and picks one for a stated reason.
- Comment anchors that survive edits, with a plan for orphaned comments.
- Per-user undo.
- Concrete example of a conflict resolved.

**Weak signals**
- `contentEditable` + saving the HTML on each change.
- Last-write-wins on the whole document.
- Comments anchored by character offset that never updates.
