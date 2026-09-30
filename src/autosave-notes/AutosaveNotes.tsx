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

import { useEffect, useRef, useState } from "react";
import styles from "./AutosaveNotes.module.css";
import {
  fetchNotes,
  type Note,
  type NotePatch,
  saveNotes,
  type SaveResult,
} from "./mockApi";

export const AutosaveNotes = () => {
  const [notes, setNotes] = useState<Record<Note["id"], Note>>({});
  const notesRef = useRef<Record<Note["id"], Note>>({});

  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">();
  const saveStatusRef = useRef<"saving" | "saved" | "error">(null);

  const [unsavedChanges, setUnsavedChanges] = useState<Set<Note["id"]>>(
    new Set(),
  );
  const unsavedChangesRef = useRef<Set<Note["id"]>>(new Set());
  const versionRef = useRef<SaveResult["version"]>(null);

  useEffect(() => {
    fetchNotes().then(({ notes, version }) => {
      const notesMap: Record<Note["id"], Note> = {};
      for (const note of notes) {
        notesMap[note.id] = note;
      }

      versionRef.current = version;
      updateNotes(notesMap);
    });
  }, []);

  useEffect(() => {
    if (unsavedChangesRef.current.size === 0 || versionRef.current === null)
      return;

    let timeoutId = setTimeout(() => {
      console.log("user stopped typing for 1s");
      batchAndSave();
    }, 1000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notes]);

  const batchAndSave = () => {
    // handle new changes while a save is already in flight
    // just return because in the saveNotes .then callback, we only removed ids that we know are updated
    if (saveStatusRef.current === "saving") {
      return;
    }

    const changesMap: Record<string, NotePatch> = {};
    for (const changedId of unsavedChangesRef.current) {
      // have to use notesRef because batchAndSave can be called recursively within the saveNotes.then
      const note = notesRef.current[changedId];
      changesMap[changedId] = {
        title: note.title,
        body: note.body,
      };
    }

    updateSaveStatus("saving");
    saveNotes(changesMap, versionRef.current!)
      .then(({ version }) => {
        versionRef.current = version;
        updateUnsavedChanges(changesMap);
        updateSaveStatus("saved");

        // check if there are still unsaved changes and if so save again
        if (unsavedChangesRef.current.size > 0) {
          batchAndSave();
        }
      })
      .catch((err) => {
        console.error(err);
        updateSaveStatus("error");
      });
  };

  const updateNotes = (notes: Record<Note["id"], Note>) => {
    setNotes(notes);
    notesRef.current = notes;
  };

  const updateUnsavedChanges = (changes: Record<string, NotePatch>) => {
    for (const [id, notePatch] of Object.entries(changes)) {
      const upToDateNote = notesRef.current[id];
      const noteHasntChanged =
        upToDateNote.title === notePatch.title &&
        upToDateNote.body === notePatch.body;

      // check that the notesRef hasn't been updated for same Ids
      // have to use the ref because when we are saving, the fetch takes a snapshot of the notes state
      if (noteHasntChanged) {
        unsavedChangesRef.current!.delete(id);
      }
    }

    setUnsavedChanges((prev) => {
      const newUnsavedChanges = new Set([...prev]);
      for (const [id, notePatch] of Object.entries(changes)) {
        const upToDateNote = notesRef.current[id];
        const noteHasntChanged =
          upToDateNote.title === notePatch.title &&
          upToDateNote.body === notePatch.body;

        // check that the notesRef hasn't been updated for same Ids
        if (noteHasntChanged) {
          newUnsavedChanges.delete(id);
        }
      }
      return newUnsavedChanges;
    });
  };

  const updateSaveStatus = (status: "saving" | "saved" | "error") => {
    setSaveStatus(status);
    saveStatusRef.current = status;
  };

  const onInputChange = (id: Note["id"], title: Note["title"]) => {
    const newNotesMap = { ...notes };
    newNotesMap[id] = {
      ...newNotesMap[id],
      title,
    };

    updateNotes(newNotesMap);
    setUnsavedChanges((prev) => new Set([...prev, id]));
    unsavedChangesRef.current = new Set([...unsavedChangesRef.current, id]);
  };

  const onTextAreaChange = (id: Note["id"], body: Note["body"]) => {
    const newNotesMap = { ...notes };
    newNotesMap[id] = {
      ...newNotesMap[id],
      body,
    };

    updateNotes(newNotesMap);
    setUnsavedChanges((prev) => new Set([...prev, id]));
    unsavedChangesRef.current = new Set([...unsavedChangesRef.current, id]);
  };

  const onRetrySave = () => {
    batchAndSave();
  };

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
          <div className={styles.errorMessage}>
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
