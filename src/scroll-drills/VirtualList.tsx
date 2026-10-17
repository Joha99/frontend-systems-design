/**
 * Drill 2: Virtual list (~30 min)
 *
 * Show all 10,000 ROWS (from ./mockApi) in a 400px-tall scroll box, but only
 * put the rows you can see in the DOM. Every row is ROW_HEIGHT px tall.
 *
 * 1. The scrollbar must look like all 10,000 rows are there
 *    (an inner element as tall as every row together).
 * 2. On scroll, work out which rows are visible from scrollTop and render
 *    only those, each at its correct position.
 * 3. Render 5 extra rows above and below (overscan) so fast scrolling
 *    doesn't flash blank space.
 * 4. Show "Rendered: N rows" above the list. It should stay under ~25.
 *
 * Stretch: an input + "Go" button that scrolls to a given row number.
 *
 * Mount it: render <VirtualList /> in src/App.tsx.
 */

import { ROWS } from "./mockApi";

const ROW_HEIGHT = 32;
const VIEWPORT_HEIGHT = 400;
const OVERSCAN = 5;

export function VirtualList() {
  void [ROWS, ROW_HEIGHT, OVERSCAN];

  return (
    <div style={{ maxWidth: 400, margin: "24px auto" }}>
      <h2>Virtual list</h2>
      <p>Rendered: 0 rows</p>
      <div style={{ height: VIEWPORT_HEIGHT, overflowY: "auto", border: "1px solid #ccc" }}>
        TODO
      </div>
    </div>
  );
}
