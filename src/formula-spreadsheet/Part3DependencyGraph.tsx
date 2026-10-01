/**
 * Spreadsheet with Formulas (Part 3 of 4): Dependency Graph + Cycles
 *
 * Start from your Part 2 code. Recalculate only what changed.
 *
 * Requirements:
 * 1. Keep dependency edges in BOTH directions: what each cell reads, and
 *    which cells read it. Update the edges when a formula changes.
 * 2. When a cell changes, recompute only the cells that depend on it
 *    (directly or transitively), in topological order, each exactly once.
 * 3. Circular references (A1 → B1 → A1, or A1 → A1) show #CYCLE! in every
 *    cell in the cycle; the rest of the sheet keeps working. Fixing one cell
 *    in the cycle clears the errors.
 * 4. Errors propagate: a cell reading an error cell shows that error.
 *
 * Done when: editing B2 recomputes only D2, D6, D8 and D10 (log it), and
 * typing =D8 into D6 shows #CYCLE! without freezing the page.
 *
 * Discussion: how does this scale to 1,000,000 cells? Would you move
 * recalculation to a web worker?
 *
 * Time target: 45 minutes.
 */

import styles from "./FormulaSpreadsheet.module.css";
import { fetchSheet } from "./mockApi";

export const Part3DependencyGraph = () => {
  // TODO: implement
  void [fetchSheet];

  return (
    <div>
      <h2>Spreadsheet with Formulas: Part 3</h2>
    </div>
  );
};
