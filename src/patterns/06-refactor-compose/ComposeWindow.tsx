/**
 * Pattern 06: Single Responsibility: Refactor a God Component
 *
 * SOLID: Single Responsibility (main), Dependency Inversion (inject the API),
 * Interface Segregation (narrow props). This is the "I inherited this
 * component, make it maintainable" exercise. It also rehearses the
 * "extend an existing system" practical in the Superhuman design round.
 *
 * Mount it: in src/App.tsx render <ComposeWindow onClose={() => {}} />.
 *
 * The component below WORKS. Try it: type "a" in To, pick a contact, write,
 * wait for "Saved", press ⌘/Ctrl+Enter. But it does everything in one place:
 * contact search, recipient parsing, validation, autosave with retry,
 * keyboard shortcuts, sending, and rendering. Every one of those changes for
 * a different reason, and none can be tested or reused alone.
 *
 * ── Part 1 (25 min): extract the pure rules ────────────────────────────────
 * Implement parseRecipients and validateDraft in draftRules.ts (graded by
 * draftRules.test.ts), then delete the inline versions below and call yours.
 *
 * ── Part 2 (30 min): split the side effects into hooks ─────────────────────
 * Keep behavior IDENTICAL. Target shape:
 *   useContactSuggestions(query)          → { suggestions, loading }
 *       debounce + AbortController + ignore stale results
 *   useAutosave(draft, save, { delayMs }) → { status, lastSavedAt }
 *       debounced; only one save in flight; if the draft changed while saving,
 *       save again after; retry once on failure
 *   useComposeShortcuts({ onSend, onClose })
 *       ⌘/Ctrl+Enter sends, Escape closes; removes its listener on unmount
 *   ComposeWindow                          → mostly JSX + wiring
 *
 * ── Part 3 (10 min): invert the dependency ─────────────────────────────────
 * ComposeWindow imports mockApi directly, so you can't render it with a fake
 * backend (Storybook, tests) or swap in a real one. Accept an `api` prop (or
 * read it from context) typed as an interface
 * { searchContacts, saveDraft, sendMessage }, defaulting to mockApi.
 *
 * Bugs hiding in the original (find them while refactoring and say so out
 * loud. That's the debugging signal):
 *   1. A slow contact search can overwrite results for a newer query.
 *   2. The keydown listener captures the FIRST render's `send` (stale
 *      closure): ⌘/Ctrl+Enter validates an empty draft and never sends.
 *   3. Autosave can run two saves at once, and they can land out of order.
 *
 * Done when: draftRules tests pass; ComposeWindow.tsx is < ~120 lines;
 * each hook could be explained in one sentence; the 3 bugs are fixed.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./ComposeWindow.module.css";
import { saveDraft, searchContacts, sendMessage, type Contact } from "./mockApi";

const DRAFT_ID = "draft_1";

export function ComposeWindow({ onClose }: { onClose: () => void }) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Array<{ name: string; sizeBytes: number }>>([]);
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [triedToSend, setTriedToSend] = useState(false);
  const autosaveTimer = useRef<number | undefined>(undefined);

  // --- contact suggestions for the last recipient being typed ---
  useEffect(() => {
    const last = to.split(/[,;]/).pop()!.trim();
    if (last.length < 1 || last.includes("@")) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchContacts(last).then((results) => setSuggestions(results)); // BUG 1
    }, 200);
    return () => clearTimeout(timer);
  }, [to]);

  // --- inline recipient parsing + validation (business rules in the view!) ---
  const parse = (input: string) => {
    const valid: string[] = [];
    const invalid: string[] = [];
    input.split(/[,;]/).forEach((p) => {
      const part = p.trim();
      if (!part) return;
      const m = part.match(/<([^>]*)>\s*$/);
      const addr = (m ? m[1] : part).trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
        if (!valid.includes(addr.toLowerCase())) valid.push(addr.toLowerCase());
      } else invalid.push(part);
    });
    return { valid, invalid };
  };
  const toParsed = parse(to);
  const ccParsed = parse(cc);
  const errors: Record<string, string> = {};
  if (toParsed.valid.length === 0) errors.to = "Add at least one recipient";
  else if (toParsed.invalid.length > 0) errors.to = "Invalid address: " + toParsed.invalid.join(", ");
  else if (new Set([...toParsed.valid, ...ccParsed.valid]).size > 50) errors.to = "Too many recipients (max 50)";
  if (ccParsed.invalid.length > 0) errors.cc = "Invalid address: " + ccParsed.invalid.join(", ");
  if (!subject.trim() && !body.trim()) errors.body = "Write a subject or message";
  if (attachments.reduce((s, a) => s + a.sizeBytes, 0) > 25 * 1024 * 1024) errors.attachments = "Attachments exceed 25 MB";
  const warnings: string[] = [];
  if (!subject.trim() && body.trim()) warnings.push("Send without a subject?");
  if (/\battach(ed|ment|ments)?\b/i.test(body) && attachments.length === 0) warnings.push("Did you forget an attachment?");
  const canSend = Object.keys(errors).length === 0;

  // --- autosave ---
  useEffect(() => {
    if (sent || (!to && !cc && !subject && !body)) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(async () => {
      setSaveStatus("saving"); // BUG 3: nothing stops a second save starting while this one runs
      try {
        const res = await saveDraft({ id: DRAFT_ID, to, cc, subject, body, attachments });
        setLastSavedAt(res.savedAt);
        setSaveStatus("saved");
      } catch {
        try {
          const res = await saveDraft({ id: DRAFT_ID, to, cc, subject, body, attachments });
          setLastSavedAt(res.savedAt);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }
    }, 800);
  }, [to, cc, subject, body, attachments, sent]);

  // --- send ---
  const send = async () => {
    setTriedToSend(true);
    if (!canSend || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await sendMessage({ id: DRAFT_ID, to, cc, subject, body, attachments });
      clearTimeout(autosaveTimer.current);
      setSent(true);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  // --- keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        send();
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // BUG 2: `send` closes over the first render's state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickSuggestion = (c: Contact) => {
    const parts = to.split(/[,;]/).slice(0, -1).map((p) => p.trim()).filter(Boolean);
    setTo([...parts, `${c.name} <${c.email}>`].join(", ") + ", ");
    setSuggestions([]);
  };

  if (sent) {
    return (
      <div className={styles.window}>
        <p>Message sent.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className={styles.window} role="dialog" aria-label="New message">
      <div className={styles.header}>
        <span>New message</span>
        <span className={styles.status} aria-live="polite">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && lastSavedAt && `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`}
          {saveStatus === "error" && "Couldn't save draft"}
        </span>
        <button onClick={onClose} aria-label="Close">×</button>
      </div>

      <label className={styles.row}>
        To
        <input value={to} onChange={(e) => setTo(e.target.value)} autoFocus />
        {!showCc && (
          <button type="button" onClick={() => setShowCc(true)}>
            Cc
          </button>
        )}
      </label>
      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((c) => (
            <li key={c.email}>
              <button type="button" onClick={() => pickSuggestion(c)}>
                {c.name} <span className={styles.muted}>{c.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {triedToSend && errors.to && <p className={styles.error}>{errors.to}</p>}

      {showCc && (
        <label className={styles.row}>
          Cc
          <input value={cc} onChange={(e) => setCc(e.target.value)} />
        </label>
      )}
      {triedToSend && errors.cc && <p className={styles.error}>{errors.cc}</p>}

      <label className={styles.row}>
        Subject
        <input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>

      <textarea className={styles.body} value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
      {triedToSend && errors.body && <p className={styles.error}>{errors.body}</p>}

      <div className={styles.row}>
        <input
          type="file"
          multiple
          onChange={(e) =>
            setAttachments(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, sizeBytes: f.size })))
          }
        />
        {attachments.length > 0 && <span className={styles.muted}>{attachments.length} attached</span>}
      </div>
      {errors.attachments && <p className={styles.error}>{errors.attachments}</p>}

      {warnings.map((w) => (
        <p key={w} className={styles.warning}>
          {w}
        </p>
      ))}
      {sendError && <p className={styles.error}>{sendError}</p>}

      <div className={styles.footer}>
        <button onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
        <span className={styles.muted}>⌘/Ctrl + Enter</span>
      </div>
    </div>
  );
}
