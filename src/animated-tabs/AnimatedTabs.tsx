/**
 * Animated Tab Switcher
 *
 * Build a tab component where switching tabs animates the content in/out
 * using Framer Motion.
 *
 * Requirements:
 * 1. Display 3-4 tabs with labels.
 * 2. Clicking a tab slides the new content in from the direction of the tab
 *    (left tab to right tab = slide left, right to left = slide right).
 * 3. Use Framer Motion's AnimatePresence for exit animations.
 * 4. The active tab indicator slides smoothly using layout animation.
 * 5. Content fades + slides on enter/exit.
 *
 * Hints:
 * - AnimatePresence with mode="wait" for sequential enter/exit.
 * - Track direction based on previous vs current tab index.
 * - motion.div with initial, animate, exit props for slide + fade.
 * - layout prop on the tab underline for smooth indicator movement.
 *
 * Time target: 15 minutes.
 */

import "./AnimatedTabs.css";

export const AnimatedTabs = () => {
  return <div>Animated Tabs</div>;
};
