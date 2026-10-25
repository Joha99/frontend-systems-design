/**
 * Mini Figma (Part 2 of 4): Select, Move + Layers Panel
 *
 * Start from your Part 1 code.
 *
 * Requirements:
 * 1. Select tool: clicking a shape selects it (blue outline). Clicking empty
 *    canvas deselects. When shapes overlap, the TOP one wins.
 * 2. Drag a shape to move it. The shape must not jump to the cursor: keep
 *    the offset between the cursor and the shape's corner.
 * 3. Delete/Backspace removes the selected shape; Escape deselects. Neither
 *    fires while typing in an input.
 * 4. Layers panel (left): one row per shape, FRONT shape at the top.
 *    - Clicking a row selects the shape; the selected row is highlighted.
 *    - Double-click a row to rename (Enter saves, Escape cancels, empty
 *      names are not allowed).
 * 5. Use semantic, keyboard-accessible elements for the panel (buttons or
 *    a listbox), not clickable divs.
 *
 * Done when: you can pick the top shape of a stack, drag it smoothly, delete
 * it, and the layers panel always matches the canvas.
 *
 * Discussion: you listen for mousemove during a drag. On the shape, the svg,
 * or the window? What happens when the mouse leaves the canvas mid-drag?
 *
 * Time target: 45 minutes.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./Figma.module.css";

type Tool = "select" | "rectangle";

type Shape = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: { r: number; g: number; b: number };
  name: string;
};

type Interaction = {
  shapeId: Shape["id"] | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

const getRandomRgbChannels = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b };
};

const getRgbaFromChannel = (color: Shape["color"], a: number = 0.15) => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${a})`;
};

export const Part2SelectMoveLayers = () => {
  const [orderIds, setOrderIds] = useState<Shape["id"][]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number }>();
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [shapes, setShapes] = useState<Record<Shape["id"], Shape>>({});
  const [interaction, setInteraction] = useState<Interaction>();
  const [selectedId, setSelectedId] = useState<Shape["id"]>();

  const canvasRef = useRef<SVGSVGElement>(null);
  const nextId = useRef<number>(1);

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

    const onMouseUp = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      // New shape is added
      if (interaction && interaction.shapeId === null) {
        const newShapes = { ...shapes };

        const shapeId = nextId.current;
        const randomColor = getRandomRgbChannels();
        const width = Math.abs(interaction.offsetX);
        const height = Math.abs(interaction.offsetY);

        if (width > 0 && height > 0) {
          newShapes[shapeId] = {
            id: shapeId,
            x: Math.min(
              interaction.startX + interaction.offsetX,
              interaction.startX,
            ),
            y: Math.min(
              interaction.startY + interaction.offsetY,
              interaction.startY,
            ),
            width,
            height,
            color: randomColor,
            name: `Shape ${shapeId}`,
          };

          setSelectedId(shapeId);
          setOrderIds((prev) => [shapeId, ...prev]);
          setShapes(newShapes);
          setInteraction(undefined);
          setActiveTool("select");
          nextId.current++;
          return;
        }
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
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [activeTool, interaction, shapes]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectedId === undefined) return;

      if (e.key === "Backspace" || e.key === "Delete") {
        setShapes((prev) => {
          const { [selectedId]: _, ...rest } = prev;
          return rest;
        });
        setOrderIds((prev) => {
          const newOrderIds = prev.filter((id) => id !== selectedId);
          return newOrderIds;
        });
        setSelectedId(undefined);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSelectedId(undefined);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  // Drags can only start on the canvas, so mousedown lives on the svg.
  const onCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
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
      setSelectedId(intersectingShape.id);
    } else {
      setSelectedId(undefined);
    }
  };

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

    for (let i = 0; i < orderIds.length; i++) {
      const id = orderIds[i];
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
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h1>Mini Figma: Part 2</h1>
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

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h2>Layers</h2>
          <ul className={styles.list}>
            {orderIds.map((id) => {
              const shape = shapes[id];
              const isSelected = selectedId === id;

              return (
                <li
                  key={id}
                  className={styles.listitem}
                  style={{
                    backgroundColor: getRgbaFromChannel(shape.color, 0.15),
                    border: `1px solid ${isSelected ? "blue" : getRgbaFromChannel(shape.color, 1)}`,
                  }}
                >
                  <button onClick={() => setSelectedId(shape.id)}>
                    {shape.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Canvas */}
        <svg
          width="800px"
          height="500px"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.canvas}
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown}
        >
          {/* Already created rectangles */}
          {orderIds.toReversed().map((id) => {
            const shape = shapes[id];
            if (!isDraggingRect || interaction.shapeId !== id) {
              const isSelected = selectedId === id;

              return (
                <rect
                  key={id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={getRgbaFromChannel(shape.color, 0.15)}
                  stroke={
                    isSelected ? "blue" : getRgbaFromChannel(shape.color, 1)
                  }
                  strokeWidth={1}
                />
              );
            }
          })}

          {/* Dragged rectable */}
          {isDraggingRect && interaction.shapeId !== null && (
            <rect
              x={shapes[interaction.shapeId].x + interaction.offsetX}
              y={shapes[interaction.shapeId].y + interaction.offsetY}
              width={shapes[interaction.shapeId].width}
              height={shapes[interaction.shapeId].height}
              fill={getRgbaFromChannel(shapes[interaction.shapeId].color, 0.15)}
              stroke="blue"
              strokeWidth={1}
              strokeDasharray={2}
            />
          )}

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
        </svg>
      </div>
    </div>
  );
};
