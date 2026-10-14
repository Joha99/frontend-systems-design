/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { MAX_ATTACHMENT_BYTES, parseRecipients, validateDraft, type Draft } from "./draftRules.ts";

const draft = (overrides: Partial<Draft> = {}): Draft => ({
  to: "ann@acme.com",
  cc: "",
  subject: "Hi",
  body: "Hello there",
  attachments: [],
  ...overrides,
});

describe("parseRecipients", () => {
  test("splits on commas and semicolons, trims, skips empties", () => {
    assert.deepEqual(parseRecipients(" ann@acme.com ;bo@acme.com,, ,cara@globex.com "), {
      valid: ["ann@acme.com", "bo@acme.com", "cara@globex.com"],
      invalid: [],
    });
  });

  test('accepts "Name <address>" and lowercases', () => {
    assert.deepEqual(parseRecipients("Ann Lee <Ann@Acme.com>, BO@ACME.COM"), {
      valid: ["ann@acme.com", "bo@acme.com"],
      invalid: [],
    });
  });

  test("dedupes case-insensitively, keeping first order", () => {
    assert.deepEqual(parseRecipients("b@x.com, a@x.com, B@X.com").valid, ["b@x.com", "a@x.com"]);
  });

  test("collects invalid parts as typed", () => {
    assert.deepEqual(parseRecipients("ann@acme, bo@acme.com, Not An Email , x y@z.com"), {
      valid: ["bo@acme.com"],
      invalid: ["ann@acme", "Not An Email", "x y@z.com"],
    });
  });

  test("empty input", () => {
    assert.deepEqual(parseRecipients("   "), { valid: [], invalid: [] });
  });
});

describe("validateDraft", () => {
  test("a good draft can be sent", () => {
    assert.deepEqual(validateDraft(draft()), { errors: {}, warnings: [], canSend: true });
  });

  test("needs at least one valid recipient in to", () => {
    const v = validateDraft(draft({ to: "", cc: "bo@acme.com" }));
    assert.equal(v.errors.to, "Add at least one recipient");
    assert.equal(v.canSend, false);
  });

  test("reports invalid addresses per field", () => {
    const v = validateDraft(draft({ to: "ann@acme.com, nope, also bad", cc: "x@" }));
    assert.equal(v.errors.to, "Invalid address: nope, also bad");
    assert.equal(v.errors.cc, "Invalid address: x@");
  });

  test("limits unique recipients across to + cc", () => {
    const to = Array.from({ length: 30 }, (_, i) => `u${i}@x.com`).join(",");
    const cc = Array.from({ length: 25 }, (_, i) => `u${i + 25}@x.com`).join(","); // 5 overlap
    assert.equal(validateDraft(draft({ to, cc })).errors.to, undefined, "exactly 50 unique is fine");
    const cc2 = Array.from({ length: 21 }, (_, i) => `v${i}@x.com`).join(",");
    assert.equal(validateDraft(draft({ to, cc: cc2 })).errors.to, "Too many recipients (max 50)");
  });

  test("blank subject and body is an error; blank subject alone is a warning", () => {
    const both = validateDraft(draft({ subject: "  ", body: "\n " }));
    assert.equal(both.errors.body, "Write a subject or message");
    assert.deepEqual(both.warnings, []);
    const subjectOnly = validateDraft(draft({ subject: "" }));
    assert.deepEqual(subjectOnly.errors, {});
    assert.deepEqual(subjectOnly.warnings, ["Send without a subject?"]);
    assert.equal(subjectOnly.canSend, true);
  });

  test("warns about a forgotten attachment", () => {
    assert.deepEqual(validateDraft(draft({ body: "See the ATTACHED deck" })).warnings, ["Did you forget an attachment?"]);
    assert.deepEqual(
      validateDraft(draft({ body: "attachment below", attachments: [{ name: "a.pdf", sizeBytes: 10 }] })).warnings,
      [],
    );
    assert.deepEqual(validateDraft(draft({ body: "I'm attaching... nope, reattach later" })).warnings, []);
  });

  test("both warnings, in order", () => {
    assert.deepEqual(validateDraft(draft({ subject: "", body: "attachments inside" })).warnings, [
      "Send without a subject?",
      "Did you forget an attachment?",
    ]);
  });

  test("attachment size limit", () => {
    const half = MAX_ATTACHMENT_BYTES / 2;
    assert.equal(
      validateDraft(draft({ attachments: [{ name: "a", sizeBytes: half }, { name: "b", sizeBytes: half }] })).errors.attachments,
      undefined,
    );
    const v = validateDraft(draft({ attachments: [{ name: "a", sizeBytes: half }, { name: "b", sizeBytes: half + 1 }] }));
    assert.equal(v.errors.attachments, "Attachments exceed 25 MB");
    assert.equal(v.canSend, false);
  });
});
