/**
 * Pattern 03: Strategy + Composite: Split Inbox Rules
 *
 * Patterns: Strategy (rules and sort orders are swappable objects),
 * Composite (and / or / not combine rules into a tree that behaves like one
 * rule). SOLID: Open/Closed (a new split or rule type = new code registered,
 * zero edits to existing code), Liskov (every rule, simple or composite, is
 * usable anywhere a Rule is expected).
 *
 * Where this shows up: Superhuman's Split Inbox ("VIP", "Team", "News"),
 * Gmail filters, saved searches, feature-flag targeting rules.
 *
 * Run the grader:  node --test 'src/patterns/03-split-inbox-rules/*.test.ts'
 *
 * ── Part 1 (20 min): leaf rules + combinators ──────────────────────────────
 * Every rule is an object { matches(email): boolean; describe(): string }.
 *
 * Leaf rules (describe() output in quotes):
 *   from("@stripe.com")      "from:@stripe.com"  a value starting with "@" matches
 *                            the sender's DOMAIN; anything else matches the full
 *                            address. Case-insensitive. "@stripe.com" must NOT
 *                            match "x@notstripe.com".
 *   subjectContains("Inv")   'subject:"Inv"'     case-insensitive substring
 *   hasLabel("vip")          "label:vip"         exact label match
 *   isUnread()               "is:unread"
 *   hasAttachment()          "has:attachment"
 *
 * Combinators:
 *   and(...rules)  all match (and() with no rules matches everything)
 *   or(...rules)   any match (or() with no rules matches nothing)
 *   not(rule)      inverts
 *
 * describe() for combinators joins children with " AND " / " OR ", and wraps a
 * child in parentheses when that child is itself an and/or. not() prints
 * "NOT x", with parentheses when x is an and/or:
 *   and(from("@a.com"), or(hasLabel("vip"), not(isUnread()))).describe()
 *     === 'from:@a.com AND (label:vip OR NOT is:unread)'
 *   not(and(isUnread(), hasAttachment())).describe()
 *     === 'NOT (is:unread AND has:attachment)'
 *
 * ── Part 2 (20 min): sort strategies + the split inbox ─────────────────────
 * A SortStrategy is a compare function (a, b) => number.
 *   newestFirst, oldestFirst          by receivedAt
 *   unreadFirst(then)                 unread before read, ties broken by `then`
 *
 * createSplitInbox({ fallbackName = "Other" } = {}) returns an object with:
 *   register(split, { before?: name })  adds { name, rule, sort? }. Splits are
 *       checked in order; `before` inserts it ahead of an existing split
 *       (unknown `before` name → append). Registering a duplicate name throws.
 *   partition(emails) → Array<{ name, emails }>: one entry per registered split
 *       in order, then the fallback LAST. Each email goes in the FIRST split
 *       whose rule matches, else the fallback. Every split (and the fallback)
 *       sorts with its own `sort`, default newestFirst. Empty splits are still
 *       returned (the UI shows "0"). Never mutate the input array.
 *
 * Talk about: why rules are objects instead of a big if/else (adding "VIP"
 * doesn't edit the partition code); how describe() makes the tree
 * debuggable; how you'd serialize rules to save them to the server (each rule
 * type gets a `toJSON` and a registry of parsers by type: still open/closed).
 */

export interface Email {
  id: string;
  from: string; // "ann@stripe.com"
  subject: string;
  labels: string[];
  unread: boolean;
  hasAttachments: boolean;
  receivedAt: number; // epoch ms
}

export interface Rule {
  matches(email: Email): boolean;
  describe(): string;
}

export type SortStrategy = (a: Email, b: Email) => number;

export interface Split {
  name: string;
  rule: Rule;
  sort?: SortStrategy;
}

// ── Part 1 ────────────────────────────────────────────────────────────────

export function from(addressOrDomain: string): Rule {
  throw new Error("not implemented");
}

export function subjectContains(text: string): Rule {
  throw new Error("not implemented");
}

export function hasLabel(label: string): Rule {
  throw new Error("not implemented");
}

export function isUnread(): Rule {
  throw new Error("not implemented");
}

export function hasAttachment(): Rule {
  throw new Error("not implemented");
}

export function and(...rules: Rule[]): Rule {
  throw new Error("not implemented");
}

export function or(...rules: Rule[]): Rule {
  throw new Error("not implemented");
}

export function not(rule: Rule): Rule {
  throw new Error("not implemented");
}

// ── Part 2 ────────────────────────────────────────────────────────────────

export const newestFirst: SortStrategy = () => {
  throw new Error("not implemented");
};

export const oldestFirst: SortStrategy = () => {
  throw new Error("not implemented");
};

export function unreadFirst(then: SortStrategy): SortStrategy {
  throw new Error("not implemented");
}

export interface SplitInbox {
  register(split: Split, options?: { before?: string }): void;
  partition(emails: readonly Email[]): Array<{ name: string; emails: Email[] }>;
}

export function createSplitInbox(
  options: { fallbackName?: string } = {},
): SplitInbox {
  throw new Error("not implemented");
}
