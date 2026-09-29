/**
 * Spreadsheet with Formulas (Part 2 of 4): Formula Parser + Evaluator
 *
 * Start from your Part 1 code. Evaluate formulas. Recomputing EVERY formula
 * on each change is fine in this part.
 *
 * Requirements:
 * 1. Raw input starting with "=" is a formula. Support numbers, cell refs
 *    (A1), + - * /, parentheses, unary minus, and SUM(range) / AVG(range)
 *    such as =SUM(A1:A5).
 * 2. Write a TOKENIZER, then a RECURSIVE-DESCENT PARSER that builds an AST,
 *    then an EVALUATOR. No eval / new Function.
 * 3. Correct precedence: =1+2*3 is 7, =(1+2)*3 is 9, =-2*3 is -6.
 * 4. Empty cells count as 0. Text used in math gives #VALUE!. A syntax error
 *    gives #ERROR!. A reference outside A1:J30 gives #REF!.
 * 5. Cells show computed values; the formula bar still shows raw input.
 *
 * Done when: the loaded receipt shows correct totals (Subtotal 23, Total
 * 24.84, Average price 3.92).
 *
 * Time target: 45 minutes.
 */

import styles from "./FormulaSpreadsheet.module.css";
import { fetchSheet } from "./mockApi";

export const Part2FormulaParser = () => {
  // TODO: implement
  void [fetchSheet];

  return <div>Spreadsheet with Formulas: Part 2</div>;
};
