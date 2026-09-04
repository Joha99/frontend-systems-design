/**
 * Interactive Spreadsheet
 *
 * Build a simplified Excel-like spreadsheet component.
 *
 * Requirements:
 * 1. Render a grid of editable cells (e.g. 10 rows x 6 columns per page).
 * 2. Column headers show letters (A, B, C, ...), row headers show numbers (1, 2, 3, ...).
 * 3. Clicking a cell selects it (highlighted border). Clicking outside deselects.
 *    Use useRef + document event listener for outside click detection.
 * 4. Double-clicking or pressing Enter on a selected cell enters edit mode (shows an input).
 * 5. Pressing Enter or Tab commits the edit and moves selection (Enter -> down, Tab -> right).
 * 6. Pressing Escape cancels the edit and restores the previous value.
 * 7. Arrow keys move the selection between cells when not editing.
 * 8. Store cell data in a Record keyed by "A1", "B2", etc.
 * 9. Formula support: cells starting with "=" evaluate expressions:
 *    - =A1+B1 (cell references with +, -, *, /)
 *    - =SUM(A1:A10) -- sum a range of cells
 *    - =AVG(A1:A10) -- average a range of cells
 *    - Parse column letter + row number to resolve cell references.
 *      Think about: converting "A" -> 0, "B" -> 1, parsing "A10" into col=0, row=9.
 * 10. Pagination: the spreadsheet has 100 rows total but displays 10 per page.
 *     Show page controls (Prev / Next / page indicator). Calculate: total pages,
 *     current row slice (page 3 shows rows 21-30), and which cell keys map to visible rows.
 *
 * Math focus:
 * - Column letter <-> index conversion (A=0, B=1, ... Z=25)
 * - Range parsing: "A1:A10" -> iterate row 1-10, column A
 * - Pagination offset: startRow = (page - 1) * pageSize
 * - SUM/AVG over a dynamic range of cell values
 */

import "./Spreadsheet.css";

export const Spreadsheet = () => {
  return <div>Spreadsheet</div>;
};
