/**
 * Pattern 06 (Part 1): extract the pure business rules out of ComposeWindow.
 *
 * Read ComposeWindow.tsx first. The same rules are buried inline there,
 * mixed with rendering and effects. Move them HERE as pure functions (no
 * React, no fetch, no Date.now()), then make ComposeWindow call them.
 *
 * Run the grader:  node --test 'src/patterns/06-refactor-compose/*.test.ts'
 *
 * parseRecipients(input)
 *   - Split on "," or ";". Trim each part; skip empty parts.
 *   - A part is either "ann@acme.com" or "Ann Lee <ann@acme.com>" (use the
 *     address inside <>).
 *   - Valid address: /^[^\s@]+@[^\s@]+\.[^\s@]+$/. Lowercase valid ones.
 *   - Dedupe valid addresses (first occurrence wins, order kept).
 *   - Invalid parts are returned trimmed, as typed, in order.
 *   → { valid: string[], invalid: string[] }
 *
 * validateDraft(draft) → { errors, warnings, canSend }
 *   errors (an object; a key is present only when that field has an error):
 *   - to:  no valid recipients in `to`  → "Add at least one recipient"
 *          else any invalid in `to`     → "Invalid address: a, b"
 *          else more than MAX_RECIPIENTS unique addresses across to + cc
 *                                       → "Too many recipients (max 50)"
 *   - cc:  any invalid in `cc`          → "Invalid address: a, b"
 *   - body: subject AND body both blank (after trim) → "Write a subject or message"
 *   - attachments: total sizeBytes > MAX_ATTACHMENT_BYTES
 *                                       → "Attachments exceed 25 MB"
 *   warnings (an array, in this order; they don't block sending):
 *   - subject blank but body isn't       → "Send without a subject?"
 *   - body mentions /\battach(ed|ment|ments)?\b/i and there are no
 *     attachments                        → "Did you forget an attachment?"
 *   canSend: true when there are no errors.
 */

export const MAX_RECIPIENTS = 50;
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export interface Draft {
  to: string;
  cc: string;
  subject: string;
  body: string;
  attachments: Array<{ name: string; sizeBytes: number }>;
}

export type DraftField = "to" | "cc" | "body" | "attachments";

export interface DraftValidation {
  errors: Partial<Record<DraftField, string>>;
  warnings: string[];
  canSend: boolean;
}

export function parseRecipients(input: string): { valid: string[]; invalid: string[] } {
  throw new Error("not implemented");
}

export function validateDraft(draft: Draft): DraftValidation {
  throw new Error("not implemented");
}
