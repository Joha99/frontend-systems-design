/**
 * Lazy Image Gallery (IntersectionObserver)
 *
 * Build an image gallery where images only load when they scroll into view.
 *
 * Requirements:
 * 1. Render 20 image placeholders in a vertical list (use placeholder divs with a fixed height).
 * 2. Each placeholder has a data attribute with the real image URL.
 *    Use: `https://picsum.photos/seed/{index}/600/400` for each image.
 * 3. When a placeholder scrolls into the viewport, replace it with the actual <img> tag.
 * 4. Use IntersectionObserver to detect when a placeholder enters the viewport.
 * 5. Once an image has loaded, stop observing that element.
 * 6. Show a "Loading..." text inside placeholders that haven't loaded yet.
 *
 * Hints:
 * - You can use a single observer for all placeholders.
 * - Track which images have loaded in a Set<number>.
 * - observer.unobserve(entry.target) stops watching a single element.
 *
 * Time target: 12 minutes.
 */

import styles from "./LazyImages.module.css";

export const LazyImages = () => {
  return <div>Lazy Images</div>;
};
