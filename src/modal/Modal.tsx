/**
 * Accessible Modal System
 *
 * Build a reusable modal component with proper accessibility and a compound component API.
 *
 * Requirements:
 * 1. Create a compound component API: <Modal>, <Modal.Trigger>, <Modal.Content>, <Modal.Close>.
 * 2. Modal.Trigger opens the modal. Modal.Close and pressing Escape close it.
 * 3. Render Modal.Content in a React portal (appended to document.body).
 * 4. Trap focus inside the modal while open — Tab cycles through focusable elements, not the page behind.
 * 5. Lock body scroll while the modal is open.
 * 6. Show a backdrop overlay. Clicking the backdrop closes the modal.
 * 7. On close, return focus to the element that triggered the modal.
 *
 * Accessibility:
 * - Modal container has role="dialog" and aria-modal="true".
 * - Modal has an aria-labelledby pointing to a heading inside it.
 * - Focus moves to the first focusable element inside the modal on open.
 *
 * Stretch:
 * - Animate open/close (fade + scale).
 * - Nested modals — opening a modal from within a modal stacks correctly.
 * - Controlled mode — accept isOpen and onClose props for external state control.
 * - Multiple sizes via a size prop (sm, md, lg).
 */

import styles from "./Modal.module.css";

export const Modal = () => {
  return (
    <div>
      <p>10. Build an accessible modal system with compound components.</p>
    </div>
  );
};
