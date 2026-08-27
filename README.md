# Frontend Systems Design Practice

React + TypeScript interview prep problems, ordered from easiest to hardest. Each problem is self-contained in its own folder under `src/`.

## Problems

### 1. Typeahead / Autocomplete — `src/typeahead/`
Search input that fetches suggestions from an API as the user types.

**Skills tested:** controlled inputs, useEffect with cleanup, debouncing (setTimeout/clearTimeout), fetch API, race condition handling (AbortController), conditional rendering

### 2. Data Table — `src/data-table/`
Sortable, filterable, paginated table of users.

**Skills tested:** derived state (useMemo), sorting with Array.sort and compareFn, case-insensitive filtering, pagination math (slice), single source of truth vs state duplication

### 3. Contact Form — `src/contact-form/`
Multi-field form with validation and API submission.

**Skills tested:** controlled forms, field-level validation, touched/visited tracking, POST requests (method, headers, body), loading/success/error states, event.preventDefault, disabled button logic

### 4. CRUD Todo List — `src/crud-list/`
Full create/read/update/delete operations with API integration.

**Skills tested:** all four HTTP methods (GET/POST/PUT/DELETE), updating local state after mutations, inline loading/error per item, checkbox toggle with API sync, optimistic updates

### 5. Modify Existing Code — *(provided at problem time)*
Fix bugs and extend incomplete code.

**Skills tested:** reading and understanding unfamiliar code, debugging, adding features to existing components, identifying edge cases

### 6. Multi-Step Form Wizard — `src/multi-step-wizard/`
Form split across multiple pages with conditional steps.

**Skills tested:** multi-step navigation, shared state across steps, conditional rendering based on prior input, step validation before proceeding, progress indicators, complex form submission

### 7. Infinite Scroll Feed — `src/infinite-scroll/`
Feed that loads more content as the user scrolls down.

**Skills tested:** IntersectionObserver, cursor/offset-based pagination, appending data without re-rendering entire list, useRef, cleanup of observers, scroll position management

### 8. Drag-and-Drop Kanban — `src/kanban/`
Kanban board with draggable cards across columns.

**Skills tested:** HTML Drag and Drop API (onDragStart, onDragOver, onDrop), dataTransfer, complex state management (multiple lists), optimistic reorder with rollback, API sync on drop

### 9. Real-Time Chat — `src/chat/`
Chat interface with polling for new messages.

**Skills tested:** setInterval inside useEffect, auto-scroll (scrollIntoView, useRef), polling with cleanup, optimistic message sending, timestamps, unread count logic

### 10. Accessible Modal — `src/modal/`
Reusable modal with compound component API and full accessibility.

**Skills tested:** compound components (React context), React portals (createPortal), focus trapping, keyboard handling (Escape), aria attributes, body scroll lock, returning focus on close

---

## Retell AI Prep (from recruiter)

### 11. Dynamic Grid Board — `src/grid-board/`
Build a dynamic board component (tic-tac-toe / sudoku style) that accepts custom rows and columns.

**Skills tested:** rendering logic (looping/mapping), Array.from, CSS Grid, dynamic grid generation, cell state toggling

### 12. File Explorer — *(to be created)*
Recursive file tree with expand/collapse folders from nested data.

**Skills tested:** recursive components, tree data structures, local toggle state per node, conditional rendering

### 13. User Matrix — *(to be created)*
Fetch users, get GitHub repo counts, display in a 3x3 grid with random placement.

**Skills tested:** chained API calls, Promise handling, random placement logic, grid rendering

### 14. Dropdown Multi-Select with Chips — *(to be created)*
Filterable dropdown with chip selection, disabled options, and click-outside-to-close.

**Skills tested:** useRef, click-outside detection (document event listener), chip UI pattern, disabled option handling, case-insensitive filtering

## Setup

```bash
npm install
npm run dev
```

## Stack

- Vite + React + TypeScript
- CSS Modules (no component libraries)
- No external dependencies — all implementations use vanilla React and browser APIs
