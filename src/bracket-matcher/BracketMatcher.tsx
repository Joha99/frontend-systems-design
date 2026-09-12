/**
 * Bracket Matcher (Code Editor Lite)
 *
 * Build a text editor that highlights matching brackets and detects
 * unmatched ones in real time.
 *
 * Requirements:
 * 1. Render a textarea for code input. As the user types, parse the
 *    text and display a styled version below with bracket highlighting.
 * 2. Match brackets: (), [], {}. For each closing bracket, find its
 *    matching opening bracket. Matched pairs get color-coded by nesting
 *    depth (depth 0 = blue, depth 1 = green, depth 2 = orange, etc.).
 * 3. Unmatched brackets (opening without closing, or closing without
 *    opening) are highlighted in red.
 * 4. When the cursor is on a bracket (track cursor position via
 *    onSelect / selectionStart), highlight its matching partner
 *    with a bold outline or background.
 * 5. Show error summary below: "2 unmatched brackets" or "All brackets matched".
 *
 * Algorithm focus:
 * - Stack-based matching: iterate through the string.
 *   Push opening brackets onto the stack (with their index).
 *   On closing bracket, pop from stack and check if it matches.
 *   If stack is empty or bracket types don't match, it's unmatched.
 *   After iteration, anything left on the stack is unmatched.
 * - Nesting depth: track current depth. Opening bracket increments,
 *   closing bracket decrements (after matching).
 *
 * Time target: 20 minutes.
 */

import styles from "./BracketMatcher.module.css";

export const BracketMatcher = () => {
  // TODO: implement

  return <div>Bracket Matcher</div>;
};
