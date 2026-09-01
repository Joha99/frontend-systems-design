/**
 * Interactive Spreadsheet
 *
 * Build a simplified Excel-like spreadsheet component.
 *
 * Requirements:
 * 1. Render a grid of editable cells (e.g. 10 rows x 6 columns).
 * 2. Column headers show letters (A, B, C, ...), row headers show numbers (1, 2, 3, ...).
 * 3. Clicking a cell selects it (highlighted border). Clicking outside deselects.
 *    Use useRef + document event listener for outside click detection.
 * 4. Double-clicking or pressing Enter on a selected cell enters edit mode (shows an input).
 * 5. Pressing Enter or Tab commits the edit and moves selection (Enter → down, Tab → right).
 * 6. Pressing Escape cancels the edit and restores the previous value.
 * 7. Arrow keys move the selection between cells when not editing.
 * 8. Store cell data in a Record keyed by "A1", "B2", etc.
 *
 * Stretch:
 * - Formula support: cells starting with "=" evaluate simple expressions (e.g. =A1+B1).
 * - Copy/paste support for single cells.
 * - Column resizing via drag on header borders.
 */

import styles from "./Spreadsheet.module.css";

export const Spreadsheet = () => {
  return <div>Spreadsheet</div>;
};
