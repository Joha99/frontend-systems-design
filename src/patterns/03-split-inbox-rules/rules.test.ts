/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  and,
  createSplitInbox,
  from,
  hasAttachment,
  hasLabel,
  isUnread,
  newestFirst,
  not,
  oldestFirst,
  or,
  subjectContains,
  unreadFirst,
  type Email,
} from "./rules.ts";

let nextId = 0;
const email = (overrides: Partial<Email> = {}): Email => ({
  id: `e${nextId++}`,
  from: "someone@example.com",
  subject: "Hello",
  labels: [],
  unread: false,
  hasAttachments: false,
  receivedAt: 1_000,
  ...overrides,
});

describe("Part 1: leaf rules", () => {
  test("from() with a domain matches the sender's domain, case-insensitively", () => {
    const rule = from("@Stripe.com");
    assert.equal(rule.matches(email({ from: "ann@stripe.com" })), true);
    assert.equal(rule.matches(email({ from: "BOB@STRIPE.COM" })), true);
    assert.equal(rule.matches(email({ from: "x@notstripe.com" })), false);
    assert.equal(rule.matches(email({ from: "stripe.com@evil.io" })), false);
  });

  test("from() with an address matches that address only", () => {
    const rule = from("Ann@stripe.com");
    assert.equal(rule.matches(email({ from: "ann@stripe.com" })), true);
    assert.equal(rule.matches(email({ from: "joann@stripe.com" })), false);
  });

  test("subjectContains is a case-insensitive substring match", () => {
    const rule = subjectContains("invoice");
    assert.equal(rule.matches(email({ subject: "Your INVOICE #42" })), true);
    assert.equal(rule.matches(email({ subject: "Receipt" })), false);
  });

  test("hasLabel, isUnread, hasAttachment", () => {
    assert.equal(hasLabel("vip").matches(email({ labels: ["vip"] })), true);
    assert.equal(hasLabel("vip").matches(email({ labels: ["vipers"] })), false);
    assert.equal(isUnread().matches(email({ unread: true })), true);
    assert.equal(isUnread().matches(email({ unread: false })), false);
    assert.equal(hasAttachment().matches(email({ hasAttachments: true })), true);
  });

  test("leaf describe()", () => {
    assert.equal(from("@stripe.com").describe(), "from:@stripe.com");
    assert.equal(subjectContains("Inv").describe(), 'subject:"Inv"');
    assert.equal(hasLabel("vip").describe(), "label:vip");
    assert.equal(isUnread().describe(), "is:unread");
    assert.equal(hasAttachment().describe(), "has:attachment");
  });
});

describe("Part 1: combinators", () => {
  test("and / or / not", () => {
    const e = email({ unread: true, labels: ["vip"] });
    assert.equal(and(isUnread(), hasLabel("vip")).matches(e), true);
    assert.equal(and(isUnread(), hasAttachment()).matches(e), false);
    assert.equal(or(hasAttachment(), hasLabel("vip")).matches(e), true);
    assert.equal(or(hasAttachment(), not(isUnread())).matches(e), false);
    assert.equal(not(hasAttachment()).matches(e), true);
  });

  test("empty and() matches everything, empty or() matches nothing", () => {
    assert.equal(and().matches(email()), true);
    assert.equal(or().matches(email()), false);
  });

  test("combinators nest (composite)", () => {
    const rule = and(from("@a.com"), or(hasLabel("vip"), not(isUnread())));
    assert.equal(rule.matches(email({ from: "x@a.com", unread: false })), true);
    assert.equal(rule.matches(email({ from: "x@a.com", unread: true })), false);
    assert.equal(rule.matches(email({ from: "x@a.com", unread: true, labels: ["vip"] })), true);
    assert.equal(rule.matches(email({ from: "x@b.com", labels: ["vip"] })), false);
  });

  test("describe() parenthesizes nested and/or", () => {
    assert.equal(
      and(from("@a.com"), or(hasLabel("vip"), not(isUnread()))).describe(),
      "from:@a.com AND (label:vip OR NOT is:unread)",
    );
    assert.equal(
      not(and(isUnread(), hasAttachment())).describe(),
      "NOT (is:unread AND has:attachment)",
    );
    assert.equal(or(isUnread(), hasAttachment()).describe(), "is:unread OR has:attachment");
  });
});

describe("Part 2: sort strategies", () => {
  const a = email({ receivedAt: 1, unread: false });
  const b = email({ receivedAt: 2, unread: true });
  const c = email({ receivedAt: 3, unread: false });

  test("newestFirst / oldestFirst", () => {
    assert.deepEqual([a, b, c].sort(newestFirst).map((e) => e.receivedAt), [3, 2, 1]);
    assert.deepEqual([c, a, b].sort(oldestFirst).map((e) => e.receivedAt), [1, 2, 3]);
  });

  test("unreadFirst breaks ties with the given strategy", () => {
    const d = email({ receivedAt: 4, unread: true });
    const sorted = [a, b, c, d].sort(unreadFirst(newestFirst)).map((e) => e.receivedAt);
    assert.deepEqual(sorted, [4, 2, 3, 1]);
  });
});

describe("Part 2: split inbox", () => {
  const vip = email({ id: "vip", from: "ceo@acme.com", receivedAt: 5 });
  const stripe = email({ id: "stripe", from: "billing@stripe.com", receivedAt: 3 });
  const stripeVip = email({ id: "stripe-vip", from: "ceo@stripe.com", labels: ["vip"], receivedAt: 4 });
  const random1 = email({ id: "r1", receivedAt: 1 });
  const random2 = email({ id: "r2", receivedAt: 2 });

  test("each email lands in the first matching split; the rest go to the fallback, last", () => {
    const inbox = createSplitInbox();
    inbox.register({ name: "VIP", rule: or(from("ceo@acme.com"), hasLabel("vip")) });
    inbox.register({ name: "Billing", rule: from("@stripe.com") });
    const result = inbox.partition([random1, stripe, vip, stripeVip, random2]);
    assert.deepEqual(
      result.map((s) => [s.name, s.emails.map((e) => e.id)]),
      [
        ["VIP", ["vip", "stripe-vip"]],
        ["Billing", ["stripe"]],
        ["Other", ["r2", "r1"]],
      ],
    );
  });

  test("register with `before` changes priority without touching other splits", () => {
    const inbox = createSplitInbox({ fallbackName: "Everything else" });
    inbox.register({ name: "VIP", rule: hasLabel("vip") });
    inbox.register({ name: "Billing", rule: from("@stripe.com") }, { before: "VIP" });
    const result = inbox.partition([stripeVip]);
    assert.deepEqual(result.map((s) => s.name), ["Billing", "VIP", "Everything else"]);
    assert.deepEqual(result[0].emails.map((e) => e.id), ["stripe-vip"]);
  });

  test("unknown `before` appends", () => {
    const inbox = createSplitInbox();
    inbox.register({ name: "A", rule: isUnread() });
    inbox.register({ name: "B", rule: isUnread() }, { before: "nope" });
    assert.deepEqual(inbox.partition([]).map((s) => s.name), ["A", "B", "Other"]);
  });

  test("duplicate names throw", () => {
    const inbox = createSplitInbox();
    inbox.register({ name: "A", rule: isUnread() });
    assert.throws(() => inbox.register({ name: "A", rule: hasAttachment() }));
  });

  test("each split uses its own sort, default newest first; empty splits are kept", () => {
    const inbox = createSplitInbox();
    inbox.register({ name: "Oldest", rule: from("@stripe.com"), sort: oldestFirst });
    inbox.register({ name: "Empty", rule: hasAttachment() });
    const s1 = email({ from: "a@stripe.com", receivedAt: 9 });
    const s2 = email({ from: "b@stripe.com", receivedAt: 7 });
    const result = inbox.partition([s1, s2, random1, random2]);
    assert.deepEqual(result[0].emails.map((e) => e.receivedAt), [7, 9]);
    assert.deepEqual(result[1], { name: "Empty", emails: [] });
    assert.deepEqual(result[2].emails.map((e) => e.receivedAt), [2, 1]);
  });

  test("partition does not mutate its input", () => {
    const inbox = createSplitInbox();
    const input = Object.freeze([random1, random2]);
    assert.doesNotThrow(() => inbox.partition(input));
    assert.deepEqual(input.map((e) => e.id), ["r1", "r2"]);
  });
});
