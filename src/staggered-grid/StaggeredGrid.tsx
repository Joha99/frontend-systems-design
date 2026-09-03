/**
 * Staggered Grid Reveal
 *
 * Build a grid of items that animate in one-by-one with a stagger effect
 * when they enter the viewport.
 *
 * Requirements:
 * 1. Display a CSS Grid of 12+ card items.
 * 2. Cards start invisible/below their final position.
 * 3. When the grid scrolls into view, cards animate in with a stagger delay
 *    (each card appears slightly after the previous one).
 * 4. Use Framer Motion variants with staggerChildren.
 * 5. Cards fade in + slide up.
 * 6. Animation triggers only once (when first entering viewport).
 *
 * Hints:
 * - Parent variant with staggerChildren: 0.1.
 * - Child variant: initial={{ opacity: 0, y: 30 }}, animate={{ opacity: 1, y: 0 }}.
 * - whileInView + viewport={{ once: true }} to trigger on scroll.
 *
 * Time target: 12 minutes.
 */

import "./StaggeredGrid.css";

export const StaggeredGrid = () => {
  return <div>Staggered Grid</div>;
};
