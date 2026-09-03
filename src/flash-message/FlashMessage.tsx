/**
 * Flash Message with useLayoutEffect
 *
 * Build a notification system that measures DOM elements before paint
 * to position toast messages without visual flicker.
 *
 * Requirements:
 * 1. A button that adds a toast notification to a stack in the top-right corner.
 * 2. Each toast has a message, a type (success/error/info), and auto-dismisses after 3 seconds.
 * 3. Use useLayoutEffect to measure each new toast's height immediately after it mounts
 *    and set its vertical offset based on the toasts above it (so they stack without overlap).
 * 4. Without useLayoutEffect, toasts would briefly flash at position 0 then jump to their
 *    correct position. useLayoutEffect prevents this flicker.
 * 5. Each toast has a manual "X" close button.
 * 6. When a toast in the middle is dismissed, the ones below it slide up.
 *
 * Hints:
 * - useLayoutEffect runs synchronously after DOM mutations but before the browser paints.
 * - useEffect runs after paint, so measuring + repositioning there causes a visible jump.
 * - Use useRef to store refs for each toast element, and measure with getBoundingClientRect().
 *
 * Time target: 15 minutes.
 */

import "./FlashMessage.css";

export const FlashMessage = () => {
  return <div>Flash Message</div>;
};
