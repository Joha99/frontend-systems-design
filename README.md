# Frontend Systems Design Practice

React + TypeScript interview prep problems. Each problem is self-contained in its own folder under `src/`.

## Problems

| Status | Problem | Path | Difficulty | Key Skills |
|--------|---------|------|------------|------------|
| ✅ | Toggle Counter | `src/toggle-counter/` | Easy | useState, derived values, controlled checkbox |
| | Character Counter Textarea | `src/char-counter/` | Easy | controlled textarea, derived state, conditional styling |
| ✅ | Contact Form | `src/contact-form/` | Easy | controlled forms, validation, POST requests, event.preventDefault |
| ✅ | Data Table | `src/data-table/` | Intermediate | useMemo, Array.sort, filtering, pagination math |
| ✅ | Typeahead / Autocomplete | `src/typeahead/` | Intermediate | debouncing, fetch API, AbortController, useEffect cleanup |
| ✅ | CRUD Todo List | `src/crud-list/` | Intermediate | all HTTP methods, local state sync, per-item loading/error |
| ✅ | Modify Existing Code | _(provided at problem time)_ | Intermediate | debugging, reading unfamiliar code, adding features |
| | Tooltip with Outside Click | `src/tooltip-hover/` | Intermediate | useRef, click-outside detection, Escape key, toggle state |
| ✅ | Debounced Search | `src/debounced-search/` | Intermediate | AbortController, debounce, fetch cleanup, AbortError filtering |
| | Lazy Image Gallery | `src/lazy-images/` | Intermediate | IntersectionObserver, unobserve, lazy loading, Set tracking |
| ✅ | Multi-Step Form Wizard | `src/multi-step-wizard/` | Intermediate | multi-step navigation, shared state, step validation, form submission |
| ✅ | Nested Comments | `src/nested-comments/` | Intermediate | recursive components, tree structures, adding to nested state |
| ✅ | Throttled Resize Tracker | `src/throttled-resize/` | Intermediate | throttle/debounce pattern, window events, cleanup |
| | Shopping Cart (useReducer) | `src/shopping-cart/` | Intermediate | useReducer, action dispatching, computed totals, complex state |
| ✅ | Real-Time Chat | `src/chat/` | Hard | setInterval in useEffect, auto-scroll, polling, useRef |
| ✅ | Infinite Scroll Feed | `src/infinite-scroll/` | Hard | IntersectionObserver, offset pagination, useRef, observer cleanup |
| | Drag-and-Drop Kanban | `src/kanban/` | Hard | HTML Drag and Drop API, dataTransfer, complex state management |
| | Accessible Modal | `src/modal/` | Hard | compound components, portals, focus trapping, aria attributes |
| | Interactive Spreadsheet | `src/spreadsheet/` | Hard | CSS Grid, keyboard navigation, controlled inputs, cell coordinates |
| | Flash Message (useLayoutEffect) | `src/flash-message/` | Hard | useLayoutEffect, DOM measurement, toast stacking, auto-dismiss |
| | Global Store (Redux pattern) | `src/global-store/` | Hard | useReducer + Context, shared state, dispatch, provider pattern |

---

## Retell AI Prep (from recruiter)

| Status | Problem | Path | Key Skills |
|--------|---------|------|------------|
| ✅ | Dynamic Grid Board | `src/grid-board/` | Array.from, CSS Grid, dynamic grid generation |
| ✅ | File Explorer | `src/file-explorer/` | recursive components, tree data, local toggle state |
| ✅ | User Matrix | `src/user-matrix/` | chained API calls, Promise.all, random placement, CSS Grid |
| ✅ | Dropdown Multi-Select with Chips | `src/multi-select/` | useRef, click-outside detection, chip UI, filtering |

## Setup

```bash
npm install
npm run dev
```

## Stack

- Vite + React + TypeScript
- CSS Modules (no component libraries)
- No external dependencies — all implementations use vanilla React and browser APIs
