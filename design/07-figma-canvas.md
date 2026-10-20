# Design: Collaborative Design Canvas (Figma-style)

**Time:** 60 min (Part 1: 35 min, Part 2: 20 min)
**Why this one:** reported as a past Superhuman question. It tests rendering choices, a non-trivial client data model, real-time sync, and undo, all on the client side.
**Related code in this repo:** `src/draggable-dock/`, `src/undo-redo/`, `src/patterns/02-command-undo/`, `src/virtual-table/` (only render what's visible)

## Prompt

> Design the frontend for a collaborative design tool: an infinite canvas where users add shapes (rectangles, ellipses, text, images), select, move and resize them, and see a layers panel and a properties panel. Several people can edit the same file at once and see each other's cursors. Undo/redo must work.
>
> **Part 2:** A file has 50,000 objects and 10 people editing. Keep pan, zoom and drag at 60fps, and keep everyone in sync.

## Clarifying questions to ask

- Which object types? Frames/groups (nesting)? Components, prototyping, comments? (Assume shapes, text, images, frames; no components or prototyping.)
- How many concurrent editors? (Assume up to ~10 per file.)
- Offline editing? (Assume no, but survive short disconnects.)
- Web only, desktop browsers? (Assume yes.)
- Performance target? (60fps for pan, zoom and drag; others see changes within ~200 ms.)
- Do we build text editing ourselves? (Say you'd overlay a normal text input while editing.)

## Assumptions to use if the interviewer says "you decide"

| | |
| --- | --- |
| File size | Typical: a few thousand objects. Large: 50k |
| Editors | Up to 10 at once, plus viewers |
| Transport | One WebSocket per open file |
| Server role | Stores the document, orders all changes, broadcasts them |

## What to produce

1. **Requirements**, with 60fps interaction and "my edits never feel laggy" as non-functional requirements.
2. **Architecture**:
   - **Document store**: all nodes by id, plus each parent's ordered children. The single source of truth.
   - **Canvas renderer**: draws the visible nodes on an HTML `<canvas>` (2D or WebGL), **not one DOM element per shape**. Re-draws on `requestAnimationFrame` when something changed.
   - **Viewport**: pan/zoom transform; converts screen ↔ canvas coordinates.
   - **Tool state machine**: select, rectangle, text, hand. Each tool interprets mouse events differently.
   - **Command layer**: every edit is an operation (`create`, `setProps`, `delete`, `move`) with an inverse, for undo and sync.
   - **Sync client**: sends local operations, applies remote ones, resends on reconnect.
   - **Presence**: other users' cursors and selections (not part of the document).
   - **React panels** (toolbar, layers, properties) in normal DOM, reading from the store.
3. **Data model**:
   ```ts
   nodes:    Record<NodeId, { id, type: "frame" | "rect" | "ellipse" | "text" | "image",
                              parentId, x, y, width, height, rotation, fill, stroke,
                              text?, imageId? }>
   children: Record<NodeId, NodeId[]>   // z-order within a parent (or a fractional `order` key on each node)
   ui:       { tool, selectedIds: NodeId[], hoverId, viewport: { x, y, zoom }, editingTextId }
   presence: Record<UserId, { name, color, cursor: { x, y }, selectedIds }>
   history:  { undo: Op[][], redo: Op[][] }   // each entry = one user action (a whole drag is one entry)
   pending:  Op[]                              // sent but not yet confirmed by the server
   ```
4. **API**:
   ```
   GET  /api/files/:id              → { nodes, version }        (first load; images by id via CDN)
   POST /api/images                 → { imageId, uploadUrl }    (upload the file, then create the node)

   WebSocket /api/files/:id/live
     client → server  { type: "ops", ops: [{ id: "op_1", kind: "setProps", nodeId, props: { x: 120 } }] }
     server → client  { type: "ops", seq: 812, userId, ops }     // server order = the truth
     server → client  { type: "ack", opIds: ["op_1"], seq: 812 }
     both directions  { type: "presence", cursor, selectedIds }  // throttled, never stored
   Reconnect: { type: "resume", sinceSeq: 811 } + resend unacknowledged ops (op ids make it idempotent)
   ```

## Deep dives the interviewer will push on

- **Why canvas, not DOM/SVG?** Thousands of DOM nodes are slow to lay out and repaint. A canvas lets you draw only what's visible, in one pass. Cost: you build hit testing, text editing and accessibility yourself. (Panels stay in React.)
- **Hit testing:** which shape is under the mouse? Check visible shapes in reverse z-order against their bounds. For big files, a **spatial index** (grid, quadtree, R-tree) so you only check nearby shapes.
- **Dragging at 60fps:** don't push every mouse move through React state. Update the node in the store and redraw the canvas on the next animation frame. Send updates to the server throttled (e.g. every 50–100 ms) and once more on mouse-up. Undo treats the whole drag as **one** entry.
- **Conflicts:** two people change the same shape at once. Figma-style answer: the **server orders all changes**, and for each **property** the last write wins. Properties are independent: I change the color, you move it, both survive. You don't need OT/CRDTs for shape properties (text content is different, see `design/05`).
- **Your own edits vs server echoes:** you set `x: 120` locally and sent it. Before the ack, a remote op with `x: 80` (sent earlier) arrives. Keep showing your pending value until your op is acknowledged, or the shape jumps back and forth.
- **Creating objects:** the client generates unique ids (UUIDs), so a new shape can be used and edited before the server confirms it.
- **Undo in multiplayer:** undo only **your own** changes, by applying the inverse (the previous property values you saved). If someone else changed that property since, decide: skip, or overwrite. Say which and why.
- **Presence:** cursors sent ~20–30 times a second, smoothed on the receiving side, removed when a user disconnects. Never stored in the document or in undo.
- **Zoom:** zoom around the mouse pointer (keep the point under the cursor fixed). All stored coordinates are canvas coordinates; only the viewport transform changes.
- **Text:** while editing, place a real `<textarea>`/`contenteditable` over the shape; on blur, write the text into the node.

## Part 2: 50k objects, 10 editors

- **Only draw what's visible:** viewport culling with the spatial index. When zoomed far out, draw simplified versions (skip text, show boxes).
- **WebGL** for very large scenes; cache rendered frames/tiles that didn't change.
- **Batch incoming remote ops** and apply them once per animation frame, not one redraw per op.
- **Keep React out of the hot path:** the layers panel is virtualized and only re-renders rows whose nodes changed; the properties panel subscribes to the selected nodes only.
- **Heavy work off the main thread:** parsing the file and building the spatial index in a Web Worker.
- **Images:** load low-res thumbnails first, full resolution only when zoomed in.

## Follow-ups

- Comments pinned to a point on the canvas or to a shape. What happens when the shape moves or is deleted?
- Components: change the main component and every instance updates. How do you store overrides?
- Version history: snapshots + the op log since the snapshot.
- Accessibility: how does a screen-reader user understand a canvas? (Mirror the layers tree as an accessible tree.)

## Self-grading rubric

**Strong signals**
- Canvas rendering with a clear reason, React only for the panels.
- A normalized document store separate from UI state and presence.
- Every edit is an operation with an inverse: undo, sync and multiplayer all build on it.
- Server-ordered changes, per-property last-write-wins, pending local values not overwritten by stale echoes.
- Throttled sending during drag, one undo entry per drag.
- Culling + spatial index + batching for Part 2.

**Weak signals**
- One React component per shape, re-rendered on every mouse move.
- "Use a CRDT" with no explanation of what it solves here.
- Undo that also undoes other people's changes.
- Cursors stored in the document or sent unthrottled.
