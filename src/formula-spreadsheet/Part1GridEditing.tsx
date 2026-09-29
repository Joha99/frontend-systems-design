/**
 * Spreadsheet with Formulas (Part 1 of 4): Grid + Keyboard Editing
 *
 * Build the spreadsheet UI with plain values (no formulas yet).
 *
 * API: fetchSheet() → { cells: { A1: "raw" }, version }
 *
 * Requirements:
 * 1. Load the sheet. Grid of columns A–J by 30 rows with header row and
 *    column. Store cells SPARSELY keyed by address ("A1") as raw strings.
 *    Show raw values for now (formulas display as typed).
 * 2. A formula bar above the grid shows the selected cell's address and
 *    raw input, and is editable.
 * 3. Keyboard (the grid is ONE tab stop):
 *    - Arrows move the selection. Tab / Shift+Tab: right / left.
 *    - Enter or F2 starts editing with the caret at the end. While editing,
 *      Enter commits and moves down, Tab commits and moves right, Escape
 *      cancels and restores the previous value.
 *    - Typing a printable character while NOT editing starts editing and
 *      REPLACES the contents with that character.
 *    - Delete/Backspace while not editing clears the cell.
 * 4. Shift+Arrow extends a rectangular range selection. A status bar shows
 *    Sum / Avg / Count of the numeric cells in the range.
 *
 * Done when: you can fill in a small table and fix a typo using only the
 * keyboard, exactly like Google Sheets.
 *
 * Time target: 45 minutes.
 */

import styles from "./FormulaSpreadsheet.module.css";
import { fetchSheet } from "./mockApi";

export const Part1GridEditing = () => {
  // TODO: implement
  void [fetchSheet];

  return <div>Spreadsheet with Formulas: Part 1</div>;
};
