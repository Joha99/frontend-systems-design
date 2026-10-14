# Design: Typeahead / Autocomplete Component (Reusable)

**Time:** 45 min (Part 1: 25 min, Part 2: 20 min)
**Why this one:** a classic "design a component" prompt. It tests API design *for other engineers* (props), caching, race conditions, and accessibility, all in a small surface.
**Related code in this repo:** `src/typeahead/`, `src/debounced-search/`, `src/searchable-dropdown/`, `src/trie-autocomplete/`, `src/mention-composer/`

## Prompt

> Design a reusable autocomplete component that product teams across the company will use: searching users, searching docs, picking a country. Some search a server, some search a local list.
>
> **Part 2:** Results feel slow and the search server is getting hammered. Improve perceived and actual performance.

## Clarifying questions to ask

- Who consumes it: other engineers (so the props API matters) or one feature?
- Single select, multi select (chips), or free text with suggestions?
- Local data, remote data, or both? How big can local data be?
- Custom rendering of each result (avatar + name + email)?
- Mobile support? Screen reader support required?
- Grouped results ("People", "Docs")?

## What to produce

1. **Component API** (the most important part of this prompt):
   ```tsx
   <Autocomplete<User>
     source={(query, { signal }) => api.searchUsers(query, { signal })}  // or a static array
     getKey={(u) => u.id}
     getLabel={(u) => u.name}
     renderItem={(u, { active }) => <UserRow user={u} active={active} />}
     onSelect={(u) => …}
     minQueryLength={1}
     debounceMs={150}
     placeholder="Search people"
   />
   ```
   Discuss: controlled vs uncontrolled `value`; render props vs slots vs a headless hook (`useAutocomplete()` returning props getters, like Downshift). Which would you ship and why?
2. **Internal architecture**: input → query state → debounced fetch (abortable) → results cache → listbox with an active index. Separate the **headless logic** (hook) from the **default UI**.
3. **State**: `query`, `results`, `status` (`idle/loading/error`), `activeIndex`, `isOpen`, `selected`.
4. **Server API** (for the remote case):
   ```
   GET /api/search/users?q=jo&limit=10   → { data: User[], query: "jo" }
   ```
   Why echo `query` back: the client can drop responses for stale queries.

## Deep dives the interviewer will push on

- **Race conditions:** the user types "j", "jo", "joh". Responses arrive "joh", "j", "jo". What renders? (Abort previous requests with `AbortController` and/or ignore responses whose query ≠ the current one.)
- **Debounce vs throttle:** which, and what delay? Should the *first* keystroke fire immediately?
- **Accessibility:** ARIA combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` (focus stays in the input), `role="listbox"`/`option`, `aria-selected`. Announce "5 results" via `aria-live`.
- **Keyboard:** ↑/↓ wrap or stop? Enter selects; Escape closes then clears; Tab?
- **Highlighting the match** in each result without `dangerouslySetInnerHTML`.
- **Empty, loading, error states**: and what about loading when results from a previous query are still showing?
- **Extensibility:** a team wants grouped results; another wants "Recent searches" when the query is empty. Can they do it without forking the component? (Open/closed: let the source return groups; let consumers render an empty state.)

## Part 2: performance

- **Client cache** keyed by query (LRU, ~50 entries, short TTL). Backspacing from "john" to "jo" is instant.
- **Prefix reuse:** if "jo" returned a *complete* result set (fewer than `limit`), filter it locally for "joh" with no request.
- **Request dedupe:** two components asking for the same query share one in-flight promise.
- **Server-side:** `Cache-Control: max-age=60` on popular queries; the CDN can cache them.
- **Prefetch** popular/recent results on focus.
- **Local data** that's large (50k countries/items): build a trie or a sorted index once, search in a Web Worker if it blocks typing.

## Self-grading rubric

**Strong signals**
- A thoughtful props API with a reason for headless vs batteries-included.
- Correct race-condition handling, explained.
- Full ARIA combobox pattern, with focus staying in the input.
- Caching with the prefix-reuse trick and in-flight dedupe.

**Weak signals**
- A component hard-coded to one endpoint.
- No answer for out-of-order responses.
- Focus moves into the list items.
