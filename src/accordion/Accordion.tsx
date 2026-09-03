/**
 * Animated Accordion
 *
 * Build a multi-section accordion where clicking a header expands/collapses
 * its content panel with a smooth height animation.
 *
 * Requirements:
 * 1. Display 4-5 accordion sections, each with a header and collapsible content.
 * 2. Clicking a header toggles that section open/closed with a smooth animation.
 * 3. Only one section can be open at a time (clicking one closes the other).
 * 4. Use CSS transitions on max-height (or height) for the animation.
 * 5. Show a rotate animation on an arrow/chevron icon in the header.
 * 6. Proper overflow: hidden on collapsed sections.
 *
 * Hints:
 * - max-height transition: set max-height to 0 when closed, a large value when open.
 * - Alternatively, use a ref to measure the content's scrollHeight for precise animation.
 * - transition: max-height 0.3s ease.
 *
 * Time target: 12 minutes.
 */

import "./Accordion.css";

export const Accordion = () => {
  return <div>Accordion</div>;
};
