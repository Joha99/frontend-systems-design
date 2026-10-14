# How to Run a Frontend System Design Interview

Read this once, then use it as the skeleton for every prompt in this folder.

The round is about **frontend architecture**: components, state, data flow, and how the client talks to the server. You don't design databases or backend services, but you **do** design the API the client calls (endpoints, request and response bodies).

## The 60-minute shape

| Time | Step | What you put on the whiteboard |
| --- | --- | --- |
| 0–5 | **Requirements** | Functional list (what users do), non-functional list (perf, offline, a11y, devices, scale). Mark what's in and out of scope. |
| 5–15 | **Architecture** | Box diagram: views/components, a client store, a data/sync layer, the server API. Arrows labeled with what flows. |
| 15–25 | **Data model** | Client state shape: server entities (normalized), UI state, where each piece lives. |
| 25–35 | **API (interface)** | Endpoints, methods, request/response bodies, pagination, errors, real-time channel. |
| 35–55 | **Deep dives** | 2–3 of: performance, offline/sync, optimistic updates, real-time, caching, a11y, error handling, extensibility. Let the interviewer pick, or propose the riskiest ones. |
| 55–60 | **Wrap-up** | What you'd do next, what you traded off, how you'd measure success. |

At the start, **ask whether they want a diagram, code, or both** for the practical part.

## Requirements: questions that apply to almost every prompt

- Who are the users, and on what devices? Desktop web, mobile web, native?
- How much data? (Items per list, size of an item, how fast it changes.)
- Does it need to work offline or on flaky networks?
- Real-time? How fresh must the data be: instant, seconds, or on refresh?
- SEO / first-load performance? (Decides SSR vs CSR.)
- Accessibility and keyboard requirements? Internationalization?
- What's the MVP vs nice-to-have? What can I skip?

## Architecture: the standard layers

```
┌──────────────────────── Client ────────────────────────┐
│  Views (components)                                     │
│     │  read via selectors / hooks     ▲ re-render      │
│     ▼  dispatch actions               │                │
│  Client store  ── normalized entities + UI state ──────│
│     │                                 ▲                │
│     ▼  commands                       │ updates        │
│  Data layer: API client, cache, request dedupe,         │
│              optimistic mutations, sync/outbox queue    │
│     │                                 ▲                │
└─────┼─────────────────────────────────┼────────────────┘
      ▼ HTTP (REST/GraphQL)             │ WebSocket / SSE / polling
                      Server API
```

Name each box's **single responsibility**. That one sentence is what "separation of concerns" means in this round.

## Data model checklist

- **Normalize** server entities: `{ byId: Record<Id, Entity>, allIds: Id[] }`. Lists hold ids, not copies.
- Separate **server state** (cache of the backend), **UI state** (selection, open panels, draft text), and **URL state** (route, filters, search).
- Say which pieces are **derived** (computed in selectors, never stored).
- For each piece of state: who owns it, who reads it, how it's invalidated.

## API checklist

- Resource-oriented REST: `GET /posts?cursor=…&limit=20`, `POST /posts/:id/likes`.
- **Cursor pagination** for feeds (stable under inserts); offset is fine for static tables.
- Response envelopes: `{ data, nextCursor }`, and one error shape: `{ error: { code, message, details? } }`.
- **Idempotency**: `PUT`/`DELETE` are naturally idempotent. For `POST`, the client sends an `Idempotency-Key` or a client-generated id.
- Real-time: WebSocket (two-way, chat), SSE (server → client only, simple), or polling (simplest, fine for slow data). Justify your choice.
- Partial responses: only fetch what the view needs (GraphQL, or `?fields=`).

## Deep-dive menu (have 2 sentences ready on each)

| Topic | Things to say |
| --- | --- |
| Rendering | CSR vs SSR vs SSG vs streaming; hydration cost; code splitting per route |
| Long lists | Virtualization (window of ~20 rows), stable keys, measured vs fixed row heights |
| Images | `srcset`/responsive sizes, lazy loading, blur placeholders, CDN, aspect-ratio boxes to avoid layout shift |
| Caching | HTTP cache headers, in-memory cache with TTL, stale-while-revalidate, request dedupe, cache invalidation on mutation |
| Optimistic updates | Apply locally, send, roll back the *specific* change on failure; temp ids → server ids |
| Offline | IndexedDB as the local source of truth, outbox queue of mutations, replay on reconnect, conflict resolution (last-write-wins vs merge) |
| Real-time | Reconnect with backoff + jitter, resubscribe, catch up missed events via a cursor/sequence number, dedupe |
| Perf metrics | LCP, INP, CLS; bundle size budgets; measuring in the field (RUM) |
| Accessibility | Semantic elements, focus management, roving tabindex, `aria-live` for async updates, keyboard shortcuts that don't fight screen readers |
| Security | XSS (never `dangerouslySetInnerHTML` user content without sanitizing), CSRF, tokens in httpOnly cookies |
| Extensibility | Plugin/registry patterns, feature flags, strategy objects instead of `switch` sprawl (see `oop-solid-patterns.md`) |

## Signals interviewers grade

**Strong:** drives the conversation with a structure; asks questions that change the design; puts numbers on things; makes explicit trade-offs ("I'm choosing X, which costs Y"); designs the API concretely (actual JSON); handles failure (loading, error, empty, offline, retries); keeps components dumb and logic in testable layers.

**Weak:** jumps to component code in minute 2; "just use Redux" with no reason; no API bodies; only the happy path; a diagram of boxes without saying what flows between them.
