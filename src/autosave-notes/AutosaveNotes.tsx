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
 *
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

import { useEffect, useRef, useState, version } from "react";
import styles from "./AutosaveNotes.module.css";
import {
  fetchNotes,
  type Note,
  type NotePatch,
  saveNotes,
  type SaveResult,
  setNetwork,
} from "./mockApi";
import { saveChanges } from "../outliner/mockApi";

export const AutosaveNotes = () => {
  const [notes, setNotes] = useState<Record<Note["id"], Note>>({});
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">();

  const [unsavedChanges, setUnsavedChanges] = useState<Set<Note["id"]>>(
    new Set(),
  );
  const unsavedChangesRef = useRef<Set<Note["id"]>>(new Set());
  const versionRef = useRef<SaveResult["version"]>(null);

  useEffect(() => {
    fetchNotes().then(({ notes, version }) => {
      console.log(notes, version);

      const notesMap: Record<Note["id"], Note> = {};
      for (const note of notes) {
        notesMap[note.id] = note;
      }

      versionRef.current = version;
      setNotes(notesMap);
    });
  }, []);

  useEffect(() => {
    if (unsavedChangesRef.current.size === 0 || versionRef.current === null)
      return;

    // save 1 second after user stops typing
    let timeoutId = setTimeout(() => {
      console.log("user stopped typing for 1s");
      setSaveStatus("saving");

      const changes: Record<string, NotePatch> = {};
      for (const changedId of unsavedChangesRef.current) {
        console.log("changedId", changedId);
        const note = notes[changedId];
        changes[changedId] = {
          title: note.title,
          body: note.body,
        };
      }

      if (versionRef.current) {
        saveNotes(changes, versionRef.current)
          .then(({ version, savedAt }) => {
            console.log("save res", version, savedAt);
            versionRef.current = version;

            // TODO: update the unsaved changes list

            setSaveStatus("saved");
          })
          .catch((err) => {
            console.error(err);
            setSaveStatus("error");
          });
      }

      // to save, we need a map of id to NodePatch
      // update version
    }, 1000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notes]); // notes changes every time user types

  const onInputChange = (id: Note["id"], title: Note["title"]) => {
    console.log("title changed for", id);
    const newNotesMap = { ...notes };
    newNotesMap[id] = {
      ...newNotesMap[id],
      title,
    };
    setNotes(newNotesMap);

    setUnsavedChanges((prev) => new Set([...prev, id]));
    unsavedChangesRef.current = new Set([...unsavedChangesRef.current, id]);
  };

  const onTextAreaChange = (id: Note["id"], body: Note["body"]) => {
    console.log("body changed for", id);
    const newNotesMap = { ...notes };
    newNotesMap[id] = {
      ...newNotesMap[id],
      body,
    };
    setNotes(newNotesMap);

    setUnsavedChanges((prev) => new Set([...prev, id]));
    unsavedChangesRef.current = new Set([...unsavedChangesRef.current, id]);
  };

  const onRetrySave = () => {};

  return (
    <div>
      <h2>Autosave Notes</h2>
      <div>
        <h3>Notes with unsaved changes</h3>
        <ul>
          {[...unsavedChanges].map((id) => {
            return <li key={id}>{id}</li>;
          })}
        </ul>
      </div>

      <div>
        <h3>Notes</h3>
        {saveStatus === "saving" && <p>Saving...</p>}
        {saveStatus === "saved" && <p>Saved successfully!</p>}
        {saveStatus === "error" && (
          <div>
            <p>There was an error saving.</p>
            <button onClick={onRetrySave}>Retry</button>
          </div>
        )}
        {Object.values(notes).map((note) => {
          return (
            <div key={note.id} className={styles.note}>
              <label>ID: {note.id}</label>
              <input
                type="text"
                value={note.title}
                onChange={(e) => onInputChange(note.id, e.currentTarget.value)}
              />
              <textarea
                value={note.body}
                onChange={(e) =>
                  onTextAreaChange(note.id, e.currentTarget.value)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
