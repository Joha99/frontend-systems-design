/**
 * Spreadsheet with Formulas (Part 4 of 4): Batched Autosave
 *
 * Start from your Part 3 code. Save edits to the server.
 *
 * API: saveCells(changes, baseVersion) → { version }
 *      changes: { [address]: raw | null }   (null = cleared)
 *      Rejects ~15% of the time, and with "CONFLICT" if baseVersion is stale.
 *
 * Requirements:
 * 1. Save RAW values only, never computed values.
 * 2. Batch commits and save 1s after the last one.
 * 3. Only one save in flight at a time. Edits made during a save go into
 *    the next batch. After success, update the version.
 * 4. On failure, retry without losing newer edits to the same cells.
 * 5. Show "Saving…" / "All changes saved" / "Offline · retrying".
 *
 * Done when: rapid edits across many cells result in a few batched saves,
 * and nothing is lost even when some saves fail.
 *
 * Time target: 35 minutes.
 */

import styles from "./FormulaSpreadsheet.module.css";
import { fetchSheet, saveCells } from "./mockApi";

export const Part4Autosave = () => {
  // TODO: implement
  void [fetchSheet, saveCells];

  return (
    <div>
      <h2>Spreadsheet with Formulas: Part 4</h2>
    </div>
  );
};
