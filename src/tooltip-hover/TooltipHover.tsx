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
 * Buttons and tooltip content:
 * - "Profile" → "View and edit your profile settings"
 * - "Messages" → "You have 3 unread messages"
 * - "Settings" → "App preferences and configuration"
 * - "Help" → "Documentation and support resources"
 *
 * Time target: 10 minutes.
 */

import styles from "./TooltipHover.module.css";

export const TooltipHover = () => {
  return <div>Tooltip Hover</div>;
};
