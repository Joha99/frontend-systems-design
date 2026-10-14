# Patterns: OOP, SOLID and Design Patterns in Frontend Code

Small, test-graded exercises for the "OOP basics / SOLID / design + architectural patterns" topics in the Superhuman FE system design round. Each one is framed around an email client, so you can reuse them as concrete examples when you talk through `design/02` and `design/06`.

Read `design/oop-solid-patterns.md` first; it maps each principle to these exercises.

## Running

Plain TypeScript, graded with Node's built-in test runner (Node 24 runs `.ts` directly). There's no React and no browser needed, except for 06 Part 2.

```bash
npm run test:patterns                                         # everything
node --test 'src/patterns/02-command-undo/*.test.ts'          # one exercise
```

Every test fails until you implement the stub. The spec is in the header comment of each stub file.

## Exercises

| Status | #  | Exercise                 | Stub file                              | Patterns / principles                         | Time   |
| ------ | -- | ------------------------ | -------------------------------------- | --------------------------------------------- | ------ |
|        | 01 | Typed Event Bus          | `01-event-bus/eventBus.ts`             | Observer, Mediator, DIP                       | 45 min |
|        | 02 | Inbox Commands + Undo    | `02-command-undo/commands.ts`          | Command, Composite, Observer, OCP, SRP        | 45 min |
|        | 03 | Split Inbox Rules        | `03-split-inbox-rules/rules.ts`        | Strategy, Composite, OCP, Liskov              | 40 min |
|        | 04 | Gmail + Outlook Adapters | `04-mail-adapters/mail.ts`             | Adapter, Factory, Facade, DIP, Liskov         | 55 min |
|        | 05 | Offline Outbox           | `05-offline-outbox/outbox.ts`          | Queue/Outbox, Command, DIP, retries/backoff   | 55 min |
|        | 06 | Refactor a God Component | `06-refactor-compose/ComposeWindow.tsx`| SRP, DIP, ISP; custom hooks; 3 planted bugs   | 65 min |

Suggested order: 02 → 05 → 04 → 06 → 03 → 01. The first two are the most Superhuman-specific (undo + offline).

## How to practice

- **Talk while you code.** For each exercise, say which principle you're applying and what it buys you ("the manager doesn't know about archive, so a new action never edits it: that's open/closed").
- **Then say the cost.** More files, more indirection. When would you *not* do this? Interviewers listen for that.
- **Connect it to the design round.** After 02 and 05, redraw `design/02-email-client-superhuman.md`'s architecture and point to where each class lives.
