/**
 * Spreadsheet with Formulas (Google Sheets lite)
 *
 * Build a spreadsheet whose cells can reference each other, recalculating
 * only what's affected, with full keyboard editing and autosave.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchSheet()                     → { cells: { A1: "raw" }, version }
 *   saveCells(changes, baseVersion)  → { version }
 *     changes: { [address]: raw | null }   (null = cleared)
 *     Rejects ~15% of the time, and with "CONFLICT" if baseVersion is stale.
 *
 * Requirements:
 * 1. Load the sheet on mount (it has a small receipt with formulas). Grid of
 *    10 columns (A–J) by 30 rows with header row/column. Store cells
 *    SPARSELY, keyed by address ("A1"), holding the RAW input. The displayed
 *    value is computed.
 * 2. Formulas start with "=". Support:
 *    - numbers, cell refs (A1), + - * /, parentheses, unary minus
 *    - SUM(range) and AVG(range), e.g. =SUM(A1:A5)
 *    Write your own tokenizer and parser (no eval / new Function).
 *    Empty cells count as 0. Non-numeric text in math gives #VALUE!.
 * 3. DEPENDENCY GRAPH: when a cell changes, recalculate only the cells that
 *    depend on it, directly or transitively, in dependency order
 *    (topological order), each exactly once.
 * 4. Circular references (A1 → B1 → A1, or A1 → A1) show #CYCLE! in every
 *    cell in the cycle, and the rest of the sheet keeps working. Fixing
 *    one cell in the cycle clears the errors.
 *    Errors propagate: a cell referencing an error cell shows that error.
 * 5. A formula bar above the grid shows the selected cell's address and raw
 *    input, and is editable.
 * 6. Keyboard (the grid is one tab stop):
 *    - Arrows: move selection. Tab / Shift+Tab: right / left.
 *    - Enter or F2: start editing (caret at end). While editing, Enter
 *      commits and moves down, Tab commits and moves right, Escape cancels
 *      and restores the previous raw value.
 *    - Typing a printable character while NOT editing starts editing and
 *      REPLACES the cell's contents with that character.
 *    - Delete / Backspace while not editing clears the cell.
 *    - Shift+Arrow extends a rectangular range selection; the status bar
 *      shows Sum / Avg / Count of the numeric cells in the range.
 * 7. Autosave: batch committed edits and save 1s after the last commit
 *    (only RAW values are saved, never computed ones). One save in flight
 *    at a time; edits made during a save go into the next batch; a failed
 *    batch is retried without losing newer edits to the same cells.
 *    Show "Saving…" / "All changes saved" / "Offline · retrying".
 *
 * Stretch:
 * - Cmd/Ctrl+C / Cmd/Ctrl+V copy and paste a cell, shifting relative refs
 *   (copying =A1+1 from B1 to B2 gives =A2+1).
 * - Undo/redo for cell edits.
 *
 * Data structure focus:
 * - Adjacency lists in BOTH directions (what I read, and who reads me), so
 *   edges can be updated when a formula changes.
 * - Topological sort of the affected subgraph (Kahn's or DFS) and cycle
 *   detection.
 * - Recursive-descent parsing to an AST that can be evaluated.
 *
 * Discussion questions:
 * - How does your design scale to 1,000,000 cells (rendering AND recalc)?
 * - Where would you run recalculation to keep typing smooth (web worker?)
 * - How would two users editing the same sheet converge?
 *
 * Time target: 120 minutes (split across two sessions if needed:
 * parser + graph first, keyboard/editing/saving second).
 */

import styles from "./FormulaSpreadsheet.module.css";
import { fetchSheet, saveCells } from "./mockApi";

export const FormulaSpreadsheet = () => {
  // TODO: implement
  void [fetchSheet, saveCells];

  return <div>Formula Spreadsheet</div>;
};
