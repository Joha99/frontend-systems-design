/**
 * Autosave Notes (batched, debounced, one save at a time)
 *
 * Build a small notes editor that saves automatically like Google Docs:
 * batched, never two requests at once, and never losing an edit.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchNotes()                   → { notes, version }  (the SERVER's copy)
 *   saveNotes(changes, baseVersion) → { version, savedAt }
 *     changes: { [noteId]: { title, body } }   (full new state of each note)
 *     Rejects with "CONCURRENT_SAVE" if a save is already in flight,
 *     "CONFLICT" if baseVersion is stale, or a network error (~15%).
 *   setNetwork({ minDelay, maxDelay, failureRate }) changes the fake network.
 *
 * Requirements:
 * 1. Load the notes on mount (loading + error states). Render each note as
 *    a title <input> and a body <textarea>, both editable.
 * 2. DIRTY SET: remember which note ids have unsaved changes.
 * 3. DEBOUNCE: start a save 1s after the user's LAST edit (in any note).
 * 4. BATCH: one request containing every dirty note, built from the
 *    CURRENT values at the moment it's sent.
 * 5. ONE AT A TIME: never call saveNotes while a save is in flight. Edits
 *    made during a save wait, and go out in the next batch as soon as the
 *    current save finishes.
 * 6. On SUCCESS: store the new version and mark the sent notes as saved,
 *    EXCEPT any note that was edited again while the save was in flight.
 *    That note is still dirty. (Think about how to detect this.)
 * 7. On FAILURE: nothing is lost. The sent notes stay dirty. Show
 *    "Couldn't save · Retry"; clicking Retry saves right away.
 * 8. Status line, always accurate:
 *    "All changes saved" / "Unsaved changes" / "Saving…" /
 *    "Couldn't save · Retry".
 * 9. A read-only "Server copy" panel that re-fetches after each successful
 *    save and shows the server's version and notes. Use it to prove that
 *    nothing is lost.
 * 10. Dev controls: a "Slow network (3s)" toggle and a "Flaky network (50%
 *    failures)" toggle that call setNetwork().
 *
 * Done when, with BOTH toggles on:
 * - Type in note A, wait for "Saving…", then type more in note A AND in
 *   note B before it finishes. Once it settles (retrying as needed), the
 *   server copy matches the editor exactly.
 * - The console never shows a CONCURRENT_SAVE or CONFLICT error.
 * - With no edits, no requests are sent at all.
 *
 * Stretch:
 * - Cmd/Ctrl+S saves immediately (skipping the debounce).
 * - Automatic retry with exponential backoff (1s, 2s, 4s, max 30s).
 * - Warn before closing the tab with unsaved changes (beforeunload).
 * - Handle CONFLICT by refetching and telling the user.
 *
 * Things to decide (be ready to explain):
 * - Which values live in STATE (they change what's rendered) and which in
 *   REFS (bookkeeping that timers and promise callbacks must read fresh)?
 * - Why can't you just use AbortController and cancel the older save?
 *
 * Time target: 45 minutes.
 */

import styles from "./AutosaveNotes.module.css";
import { fetchNotes, saveNotes, setNetwork } from "./mockApi";

export const AutosaveNotes = () => {
  // TODO: implement
  void [fetchNotes, saveNotes, setNetwork];

  return <div>Autosave Notes</div>;
};
