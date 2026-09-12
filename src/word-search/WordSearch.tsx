/**
 * Word Search Puzzle
 *
 * Build an interactive word search grid where words are hidden in
 * a letter grid and the user finds them by clicking/dragging.
 *
 * Requirements:
 * 1. Generate a 12x12 grid of letters. Place 8 words from a word list
 *    into the grid in random positions and directions (horizontal-right,
 *    vertical-down, diagonal-down-right, diagonal-down-left).
 *    Words must not overlap conflictingly (same position must have same letter).
 *    Fill remaining cells with random letters.
 * 2. Show the word list beside the grid. Found words get strikethrough.
 * 3. Click a cell to start a selection, drag to the end cell to complete it.
 *    Only allow straight lines (horizontal, vertical, or diagonal).
 *    Highlight cells along the line as the user drags.
 * 4. On mouseup, check if the selected cells spell any unfound word
 *    (forward or backward). If yes, mark it found and keep it highlighted.
 *    If no, clear the selection.
 * 5. Win state: all words found. Show completion message with time taken.
 * 6. "New Puzzle" button regenerates the grid.
 *
 * Algorithm focus:
 * - Word placement: for each word, try random (row, col, direction) combos.
 *   Validate the word fits within grid bounds and doesn't conflict with
 *   existing letters. Backtrack if placement fails after N attempts.
 * - Selection validation: compute the direction vector from start to end cell.
 *   Check it's one of the 8 valid directions (dx, dy where each is -1, 0, or 1).
 *   Extract letters along that line and check against the word list.
 * - Grid bounds: word of length L at position (r,c) in direction (dr,dc)
 *   needs r + dr*(L-1) in [0, rows) and c + dc*(L-1) in [0, cols).
 *
 * Time target: 35 minutes.
 */

import styles from "./WordSearch.module.css";

export const WordSearch = () => {
  // TODO: implement

  return <div>Word Search</div>;
};
