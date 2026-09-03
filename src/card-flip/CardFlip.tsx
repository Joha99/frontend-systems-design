/**
 * Card Flip Gallery
 *
 * Build a gallery of cards that flip to reveal back content on click.
 *
 * Requirements:
 * 1. Display a grid of 6 cards showing front content (image or title).
 * 2. Clicking a card flips it 180 degrees to show the back (description/details).
 * 3. Clicking again flips it back.
 * 4. Use CSS 3D transforms: perspective, rotateY, backface-visibility.
 * 5. Smooth flip transition (0.6s ease).
 * 6. Only one card can be flipped at a time (clicking another flips the previous back).
 *
 * Hints:
 * - Parent needs perspective: 1000px.
 * - Inner wrapper gets transform-style: preserve-3d and the rotateY transition.
 * - Front and back faces: position absolute, backface-visibility: hidden.
 * - Back face starts with rotateY(180deg).
 *
 * Time target: 15 minutes.
 */

import "./CardFlip.css";

export const CardFlip = () => {
  return <div>Card Flip</div>;
};
