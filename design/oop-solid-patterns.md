# OOP, SOLID, and Design Patterns, Applied to Frontend

The Superhuman FE system design round lists "OOP basics, SOLID principles usage, design + architectural patterns". Interviewers want to hear these **applied to real UI code**, not textbook definitions. For each idea below, you should be able to give: one sentence, a frontend example, and the smell it fixes.

Practice them in code: `src/patterns/` (graded by tests; see its README).

---

## OOP basics in 4 lines

| Concept | One sentence | Frontend example |
| --- | --- | --- |
| **Encapsulation** | Hide state behind methods so callers can't break invariants. | A `Cache` class whose `Map` is private; callers use `get`/`set`, so TTL and LRU rules always hold. |
| **Abstraction** | Expose *what* something does, not *how*. | `MailProvider.listThreads()`: the inbox doesn't know if it's Gmail or Outlook. |
| **Inheritance** | Reuse by "is-a". Use sparingly. | Rare in modern React. Prefer composition. Error classes (`class ApiError extends Error`) are the classic good use. |
| **Polymorphism** | Different objects, same interface, called the same way. | Every command has `apply()`/`invert()`; the undo manager calls them without knowing which command it is. |

**Composition over inheritance** is the most-quoted principle in frontend: build components from smaller ones (children, slots, hooks) rather than subclassing.

In React you mostly use these ideas through **modules, closures, and interfaces** rather than `class`. That's fine to say out loud: "In React I'd express this as a hook plus a plain object implementing this interface."

---

## SOLID

### S: Single Responsibility
**A module should have one reason to change.**
- Smell: a 600-line `ComposeWindow` that fetches contacts, validates, autosaves, handles shortcuts, and renders.
- Fix: `useContacts()` (data), `validateDraft()` (pure rule), `useAutosave()` (side effect), `useComposeShortcuts()` (keyboard), and a component that mostly renders.
- How to say it: "Rendering, data fetching, business rules, and side effects change for different reasons, so I keep them in different places."
- Exercise: `src/patterns/06-refactor-compose/`

### O: Open/Closed
**Open for extension, closed for modification.** Add behavior by adding code, not editing working code.
- Smell: `switch (view.type) { case "inbox": … case "starred": … }` repeated in five files; every new view edits all five.
- Fix: a registry of view *rules* (`{ id, matches(thread), sort }`). A new view = a new object registered in one place.
- Exercise: `src/patterns/03-split-inbox-rules/`

### L: Liskov Substitution
**Anything implementing an interface must be usable wherever that interface is expected, without surprises.**
- Smell: `OutlookProvider.archive()` throws "not supported", so callers add `if (provider instanceof OutlookProvider)`.
- Fix: the adapter must honor the contract (map "archive" to "move to Archive folder"), or the interface is wrong and should be split.
- Frontend version: a custom `<Button>` that drops `onClick` when `disabled` is fine; one that ignores `type="submit"` breaks substitutability with `<button>`.

### I: Interface Segregation
**Don't force consumers to depend on things they don't use.**
- Smell: every component receives the whole `store` object; a `UserAvatar` takes a full `User` with 30 fields and re-renders when any change.
- Fix: narrow props (`{ name, avatarUrl }`); selectors (`useStore(s => s.users[id].name)`); small interfaces (`Readable`, `Writable`) instead of one fat one.

### D: Dependency Inversion
**Depend on abstractions; inject the concrete thing.**
- Smell: `InboxService` does `import { gmailClient } from "./gmail"` and calls it directly. You can't test it or add Outlook without editing it.
- Fix: `new InboxService(provider: MailProvider)`. Tests pass a fake; prod passes the Gmail adapter. In React: pass the API client through context or props.
- Exercise: `src/patterns/04-mail-adapters/`

---

## Patterns you should be able to sketch on a whiteboard

| Pattern | Problem it solves | Frontend example | Exercise |
| --- | --- | --- | --- |
| **Observer / Pub-Sub** | Many parts react to changes without knowing each other | Store subscriptions, `EventTarget`, WebSocket event fan-out, `useSyncExternalStore` | `01-event-bus` |
| **Command** | Actions as objects you can queue, log, undo, replay | Undo/redo, keyboard shortcuts → commands, offline outbox of mutations | `02-command-undo` |
| **Strategy** | Swap an algorithm at runtime | Sort/filter rules, validation rules, pricing rules, retry policies | `03-split-inbox-rules` |
| **Composite** | Treat a tree of things like one thing | `and(rule, or(rule, not(rule)))`, nested menus, component trees | `03-split-inbox-rules` |
| **Adapter** | Make an incompatible interface fit yours | Normalize Gmail/Outlook/API responses into your domain model | `04-mail-adapters` |
| **Facade** | One simple entry point over a messy subsystem | An `api` module hiding fetch, auth headers, retries, errors | `04-mail-adapters` |
| **Repository** | Hide where data lives (memory, IndexedDB, network) | `threadsRepo.get(id)` reads local, falls back to network | `05-offline-outbox` |
| **Queue / Outbox** | Reliable delivery of side effects | Offline mutations, retry with backoff, idempotency keys | `05-offline-outbox` |
| **Singleton** | One shared instance | A socket manager or analytics client. Mention the downside: hidden global state, hard to test; prefer injecting one instance. | n/a |
| **Factory** | Create objects without the caller knowing the concrete class | `createProvider(account)` returns the right adapter | `04-mail-adapters` |
| **Mediator** | Components talk through a hub, not to each other | A form controller coordinating fields; a keyboard shortcut registry | `01-event-bus` |
| **State machine** | Explicit states + allowed transitions | Upload: `idle → uploading → success/error`; a socket: `connecting → open → reconnecting` | n/a |

### Architectural patterns (name-drop with a sentence)

- **Flux / unidirectional data flow**: view → action → store → view. Why: predictable updates, easy debugging. Redux, Zustand, `useReducer`.
- **MVC / MVVM**: model (data + rules), view (render), controller/view-model (glue). In React terms: store + selectors / hooks / components.
- **Container vs presentational components**: containers fetch and connect, presentational ones render props. Hooks have mostly replaced the container *component*, but the split of responsibilities still matters.
- **Headless components**: logic in a hook (`useCombobox`), markup chosen by the consumer. Max reuse, design-system-friendly.
- **Micro-frontends**: independently deployed slices of one app. Mostly a team-scaling tool; costs consistency and bundle size.
- **Local-first / offline-first**: the local store is the source of truth for the UI; sync is a background process. (Superhuman, Linear.)

---

## Phrases that land in the interview

- "I'll keep the business rule as a pure function so it's testable and the component just renders it."
- "These two change for different reasons, so I'll separate them."
- "Every action goes through one command interface, which gives us undo, shortcuts, and offline for free."
- "I'd inject the API client so the service doesn't depend on the concrete transport."
- "To add a new view type I'd register a new rule object rather than add another case to a switch. That keeps it open for extension."
- "The trade-off is more indirection. For a feature this small I wouldn't add the abstraction yet."

The last one matters. Knowing **when not to** apply a pattern is a senior signal.
