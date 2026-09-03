/**
 * Tooltip with Outside Click (Outside Click)
 *
 * Build a set of buttons that each show a tooltip popup when clicked.
 * Only one tooltip can be open at a time. Clicking outside closes it.
 *
 * Requirements:
 * 1. Render 4 buttons with different labels.
 * 2. Clicking a button toggles its tooltip (a small box above/below the button with extra info).
 * 3. Clicking a different button closes the current tooltip and opens the new one.
 * 4. Clicking anywhere outside a tooltip or button closes the open tooltip.
 *    Use useRef + document.addEventListener("mousedown") for outside click detection.
 * 5. Pressing Escape closes the open tooltip.
 * 6. Each tooltip shows different content based on the button.
 *
 * Time target: 10 minutes.
 */

import { useEffect, useRef, useState } from "react";
import "./TooltipHover.css";

interface ButtonConfig {
  id: number;
  label: string;
  tooltip: string;
}

const BUTTONS: ButtonConfig[] = [
  { id: 1, label: "Profile", tooltip: "View and edit your profile settings" },
  { id: 2, label: "Messages", tooltip: "You have 3 unread messages" },
  { id: 3, label: "Settings", tooltip: "App preferences and configuration" },
  { id: 4, label: "Help", tooltip: "Documentation and support resources" },
];

export const TooltipHover = () => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const buttonRefs = useRef<Record<number, HTMLDivElement>>({});

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const clickIsInButton = Object.values(buttonRefs.current).some(
        (element) => element.contains(e.target as Node),
      );
      if (!clickIsInButton) {
        setActiveTooltip(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClick = (id: number) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  return (
    <div className="buttons">
      {BUTTONS.map(({ id, label, tooltip }) => (
        <div
          key={id}
          className="button"
          ref={(el) => {
            buttonRefs.current[id] = el;
          }}
        >
          <button
            className="anchor"
            style={{ anchorName: `--anchor-${id}` }}
            onClick={() => handleClick(id)}
          >
            {label}
          </button>
          {activeTooltip === id && (
            <div
              className="tooltip"
              style={{ positionAnchor: `--anchor-${id}` }}
            >
              {tooltip}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
