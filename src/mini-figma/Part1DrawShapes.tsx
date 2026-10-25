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
 */

import { useEffect, useRef, useState } from "react";
import styles from "./Figma.module.css";

let nextId = 1;

type Tool = "select" | "rectangle";

type Shape = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Interaction = {
  shapeId: Shape["id"] | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

export const Part1DrawShapes = () => {
  const [cursor, setCursor] = useState<{ x: number; y: number }>();
  const [activeTool, setActiveTool] = useState<Tool>("rectangle");
  const [shapes, setShapes] = useState<Record<Shape["id"], Shape>>({});
  const [interaction, setInteraction] = useState<Interaction>();

  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const { xInCanvas, yInCanvas } = clampCoordinateToCanvas(
        e.clientX,
        e.clientY,
      );

      const isCreatingNewRect = interaction && interaction.shapeId === null;
      const isDragging = interaction && interaction.shapeId !== null;

      setCursor({
        x: xInCanvas,
        y: yInCanvas,
      });

      if (isCreatingNewRect || isDragging) {
        setInteraction({
          ...interaction,
          offsetX: xInCanvas - interaction.startX,
          offsetY: yInCanvas - interaction.startY,
        });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const { xInCanvas, yInCanvas } = clampCoordinateToCanvas(
        e.clientX,
        e.clientY,
      );

      if (activeTool === "rectangle") {
        setInteraction({
          shapeId: null,
          startX: xInCanvas,
          startY: yInCanvas,
          offsetX: 0,
          offsetY: 0,
        });
        return;
      }

      const intersectingShape = getIntersectingShape(xInCanvas, yInCanvas);

      if (intersectingShape !== null) {
        setInteraction({
          shapeId: intersectingShape.id,
          startX: xInCanvas,
          startY: yInCanvas,
          offsetX: 0,
          offsetY: 0,
        });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      // New shape is added
      if (interaction && interaction.shapeId === null) {
        const newShapes = { ...shapes };
        newShapes[nextId] = {
          id: nextId,
          x: Math.min(
            interaction.startX + interaction.offsetX,
            interaction.startX,
          ),
          y: Math.min(
            interaction.startY + interaction.offsetY,
            interaction.startY,
          ),
          width: Math.abs(interaction.offsetX),
          height: Math.abs(interaction.offsetY),
        };

        setShapes(newShapes);
        setInteraction(undefined);
        setActiveTool("select");
        nextId++;
        return;
      }

      // Shape was moved
      if (interaction && interaction.shapeId !== null) {
        const newShapes = { ...shapes };
        const draggedShape = shapes[interaction.shapeId];

        newShapes[interaction.shapeId] = {
          ...draggedShape,
          x: draggedShape.x + interaction.offsetX,
          y: draggedShape.y + interaction.offsetY,
        };

        setShapes(newShapes);
        setInteraction(undefined);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [activeTool, interaction, shapes]);

  const clampCoordinateToCanvas = (clientX: number, clientY: number) => {
    const canvasRect = canvasRef.current!.getBoundingClientRect();

    const xInCanvas = Math.min(
      canvasRect.width,
      Math.max(0, clientX - canvasRect.left),
    );
    const yInCanvas = Math.min(
      canvasRect.height,
      Math.max(0, clientY - canvasRect.top),
    );

    return {
      xInCanvas,
      yInCanvas,
    };
  };

  const isWithinCanvas = (x: number, y: number) => {
    if (!canvasRef.current) return false;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    return (
      x > canvasRect!.left &&
      x < canvasRect!.right &&
      y > canvasRect!.top &&
      y < canvasRect!.bottom
    );
  };

  const getIntersectingShape = (
    xInCanvas: number,
    yInCanvas: number,
  ): Shape | null => {
    if (!canvasRef.current) return null;

    const ids = Object.keys(shapes);

    for (let i = ids.length; i >= 0; i--) {
      const id = Number(ids[i]);
      const shape = shapes[id];

      if (!shape) continue;

      const leftEdge = shape.x;
      const rightEdge = shape.x + shape.width;
      const topEdge = shape.y;
      const bottomEdge = shape.y + shape.height;

      const isIntersecting =
        xInCanvas >= leftEdge &&
        xInCanvas <= rightEdge &&
        yInCanvas >= topEdge &&
        yInCanvas <= bottomEdge;

      if (isIntersecting) {
        return shapes[id];
      }
    }
    return null;
  };

  const isCreatingNewRect = interaction && interaction.shapeId === null;
  const isDraggingRect = interaction && interaction.shapeId !== null;

  return (
    <div>
      <h2>Mini Figma: Part 1</h2>
      <div className={styles.toolbar}>
        <button
          className={`${activeTool === "select" ? styles.activeTool : ""}`}
          onClick={() => setActiveTool("select")}
        >
          Select (V)
        </button>
        <button
          className={`${activeTool === "rectangle" ? styles.activeTool : ""}`}
          onClick={() => setActiveTool("rectangle")}
        >
          Rectangle (R)
        </button>
      </div>

      {/* Canvas */}
      <svg
        width="800px"
        height="500px"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.canvas}
        ref={canvasRef}
      >
        {/* Moving cursor inside canvas */}
        {cursor && <circle cx={cursor.x} cy={cursor.y} fill="grey" r="5" />}

        {/* New rectangle being created */}
        {isCreatingNewRect && (
          <rect
            x={
              interaction.offsetX < 0
                ? interaction.startX + interaction.offsetX
                : interaction.startX
            }
            y={
              interaction.offsetY < 0
                ? interaction.startY + interaction.offsetY
                : interaction.startY
            }
            width={Math.abs(interaction.offsetX)}
            height={Math.abs(interaction.offsetY)}
            fill="none"
            stroke="grey"
            strokeWidth={1}
            strokeDasharray={2}
          />
        )}

        {/* Dragged rectable */}
        {isDraggingRect && interaction.shapeId !== null && (
          <rect
            x={shapes[interaction.shapeId].x + interaction.offsetX}
            y={shapes[interaction.shapeId].y + interaction.offsetY}
            width={shapes[interaction.shapeId].width}
            height={shapes[interaction.shapeId].height}
            fill="none"
            stroke="blue"
            strokeWidth={1}
            strokeDasharray={2}
          />
        )}

        {/* Already created rectangles */}
        {Object.values(shapes).map((shape) => {
          if (!isDraggingRect || interaction.shapeId !== shape.id) {
            return (
              <rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill="none"
                stroke="grey"
                strokeWidth={1}
              />
            );
          }
        })}
      </svg>
    </div>
  );
};
