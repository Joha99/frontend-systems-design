# Frontend Systems Design Practice

React + TypeScript interview prep problems. Each problem is self-contained in its own folder under `src/`.

## Problems

| Status | Problem                         | Path                         | Difficulty   | Key Skills                                                                       |
| ------ | ------------------------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------- |
| ✅     | Toggle Counter                  | `src/toggle-counter/`        | Easy         | useState, derived values, controlled checkbox                                    |
|        | Character Counter Textarea      | `src/char-counter/`          | Easy         | controlled textarea, derived state, conditional styling                          |
| ✅     | Contact Form                    | `src/contact-form/`          | Easy         | controlled forms, validation, POST requests, event.preventDefault                |
| ✅     | Data Table                      | `src/data-table/`            | Intermediate | useMemo, Array.sort, filtering, pagination math                                  |
| ✅     | Typeahead / Autocomplete        | `src/typeahead/`             | Intermediate | debouncing, fetch API, AbortController, useEffect cleanup                        |
| ✅     | CRUD Todo List                  | `src/crud-list/`             | Intermediate | all HTTP methods, local state sync, per-item loading/error                       |
| ✅     | Modify Existing Code            | _(provided at problem time)_ | Intermediate | debugging, reading unfamiliar code, adding features                              |
| ✅     | Tooltip with Outside Click      | `src/tooltip-hover/`         | Intermediate | useRef, click-outside detection, Escape key, toggle state                        |
| ✅     | Debounced Search                | `src/debounced-search/`      | Intermediate | AbortController, debounce, fetch cleanup, AbortError filtering                   |
| ✅     | Lazy Image Gallery              | `src/lazy-images/`           | Intermediate | IntersectionObserver, unobserve, lazy loading, Set tracking                      |
| ✅     | Multi-Step Form Wizard          | `src/multi-step-wizard/`     | Intermediate | multi-step navigation, shared state, step validation, form submission            |
| ✅     | Nested Comments                 | `src/nested-comments/`       | Intermediate | recursive components, tree structures, adding to nested state                    |
| ✅     | Throttled Resize Tracker        | `src/throttled-resize/`      | Intermediate | throttle/debounce pattern, window events, cleanup                                |
| ✅     | Shopping Cart (useReducer)      | `src/shopping-cart/`         | Intermediate | useReducer, action dispatching, computed totals, complex state                   |
| ✅     | Real-Time Chat                  | `src/chat/`                  | Hard         | setInterval in useEffect, auto-scroll, polling, useRef                           |
| ✅     | Infinite Scroll Feed            | `src/infinite-scroll/`       | Hard         | IntersectionObserver, offset pagination, useRef, observer cleanup                |
| ✅     | Drag-and-Drop Kanban            | `src/kanban/`                | Hard         | HTML Drag and Drop API, dataTransfer, complex state management                   |
| ✅     | Accessible Modal                | `src/modal/`                 | Hard         | compound components, portals, focus trapping, paginated list in modal            |
| ✅     | Interactive Spreadsheet         | `src/spreadsheet/`           | Hard         | tabIndex, keyboard nav, focus management, event propagation, outside click       |
| ✅     | Flash Message (useLayoutEffect) | `src/flash-message/`         | Hard         | useLayoutEffect, DOM measurement, toast stacking, auto-dismiss                   |
| ✅     | Global Store (Redux pattern)    | `src/global-store/`          | Hard         | useReducer + Context, paginated notifications, page clamping                     |
| ✅     | Paginated Table                 | `src/paginated-table/`       | Hard         | server-side pagination, skip/limit, page window math, sortable columns           |
| ✅     | Calendar Month View             | `src/calendar/`              | Hard         | date math, grid layout, week numbers, month navigation                           |
|        | Social Media Feed               | `src/virtual-feed/`          | Hard         | IntersectionObserver (multiple), infinite scroll, read tracking, new post banner |
|        | Image Carousel                  | `src/image-carousel/`        | Hard         | IntersectionObserver, lazy loading, autoplay, scroll-snap, slide detection       |
| ✅     | Searchable Dropdown             | `src/searchable-dropdown/`   | Hard         | binary search, range index, virtual scroll, keyboard nav, outside click          |
| ✅     | Command Palette                 | `src/command-palette/`       | Hard         | document keydown, portal, focus save/restore, roving highlight, focus trapping   |
| ✅     | Accessible Tabs                 | `src/accessible-tabs/`       | Hard         | roving tabIndex, ARIA tabs pattern, dynamic add/remove, focus across boundaries  |
|        | Tree Select                     | `src/tree-select/`           | Hard         | roving tabIndex, tree flattening, expand/collapse focus, type-ahead, ARIA tree   |
|        | Virtualized Data Table          | `src/virtual-table/`         | Hard         | virtualization with table layout, sortable columns, inline editing, keyboard nav |
|        | CRUD Dashboard                  | `src/crud-dashboard/`        | Hard         | optimistic updates, rollback, per-item loading, form validation, infinite scroll |
|        | Debounced Multi-Filter Panel    | `src/debounced-filters/`     | Hard         | multiple debounce timers, AbortController, server + client filtering, cleanup    |

---

## CSS / Animation / Visual

| Status | Problem                   | Path                    | Difficulty   | Key Skills                                                           |
| ------ | ------------------------- | ----------------------- | ------------ | -------------------------------------------------------------------- |
|        | Animated Accordion        | `src/accordion/`        | Easy         | CSS transitions, max-height animation, overflow hidden               |
|        | Responsive Nav Bar        | `src/nav-bar/`          | Easy         | flexbox, media queries, hamburger menu, mobile breakpoint            |
|        | Skeleton Loading Screen   | `src/skeleton-loader/`  | Easy         | CSS keyframes, pulse animation, placeholder layout                   |
|        | Animated Tab Switcher     | `src/animated-tabs/`    | Intermediate | Framer Motion, AnimatePresence, layout animations, exit animations   |
|        | Reorderable List          | `src/reorderable-list/` | Intermediate | Framer Motion Reorder, drag constraints, layout animation            |
|        | Card Flip Gallery         | `src/card-flip/`        | Intermediate | CSS perspective, transform rotateY, backface-visibility, transition  |
|        | Staggered Grid Reveal     | `src/staggered-grid/`   | Intermediate | Framer Motion staggerChildren, variants, CSS Grid, viewport entry    |
|        | Animated Page Transitions | `src/page-transitions/` | Hard         | Framer Motion AnimatePresence, route-like transitions, shared layout |
|        | Draggable Dock / Toolbar  | `src/draggable-dock/`   | Hard         | Framer Motion drag, spring physics, snap-to-edge, constraints        |

## Setup

```bash
npm install
npm run dev
```

## Stack

- Vite + React + TypeScript
- CSS Modules (no component libraries)
- No external dependencies — all implementations use vanilla React and browser APIs
