/**
 * Mini Figma (Part 1 of 4): Draw Rectangles
 *
 * A canvas where you drag to draw rectangles. No API: everything is local.
 *
 * Requirements:
 * 1. Toolbar with two tools: Select (V) and Rectangle (R). Clicking a tool
 *    or pressing its key switches tools; the active tool is highlighted.
 * 2. Canvas: an <svg> about 800×500 with a light border.
 * 3. With the Rectangle tool: mouse down → drag → mouse up draws a rectangle.
 *    - Show a dashed preview while dragging.
 *    - Dragging up or left still works (normalize to x, y, width, height).
 *    - Ignore tiny drags (< 4px): no shape.
 *    - On mouse up, add the shape, select it, and switch back to Select.
 * 4. Each new shape gets a random fill and a name like "Rectangle 3".
 * 5. State shape (normalized):
 *      shapes: Record<id, { id, name, x, y, width, height, fill }>
 *      order:  id[]          // back → front; later = drawn on top
 *    plus UI state: tool, selectedId, draft (the in-progress preview).
 *
 * Done when: you can draw several overlapping rectangles in any drag
 * direction, and the newest is on top and selected.
 *
 * Discussion: why keep the drag preview out of `shapes`? What would other
 * users see if this were multiplayer?
 *
 * Time target: 40 minutes.
 */

export const Part1DrawShapes = () => {
  // TODO: implement
  return (
    <div>
      <h2>Mini Figma: Part 1</h2>
    </div>
  );
};
