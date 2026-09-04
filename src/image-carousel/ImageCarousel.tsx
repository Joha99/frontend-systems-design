/**
 * Image Carousel with Lazy Loading + Autoplay
 *
 * Build an image carousel similar to Instagram's post carousel or a product
 * image gallery, with lazy loading, autoplay, and dot indicators.
 *
 * API: GET https://dummyjson.com/products?limit=5&select=title,images,thumbnail
 * Response: { products: [{ id, title, images: [url, ...], thumbnail }] }
 *
 * Requirements:
 * 1. Fetch 5 products. Each product has multiple images. Display one product at a time
 *    with a horizontal carousel of its images.
 * 2. Carousel mechanics: CSS scroll-snap on a horizontal overflow container.
 *    Prev/Next arrow buttons on the sides. Dot indicators below showing current slide.
 * 3. Lazy loading: only load images that are currently visible or one slide ahead.
 *    Use IntersectionObserver on each slide (rootMargin: "0px 100% 0px 0px" to preload
 *    the next slide). Show a placeholder/skeleton until loaded.
 * 4. Autoplay: carousel advances every 4 seconds. Pauses when user hovers over it or
 *    when any slide is partially off-screen (use IntersectionObserver with threshold: 1.0
 *    on the carousel container to detect if it's fully visible).
 * 5. Current slide detection: use IntersectionObserver (threshold: 0.5) on each slide
 *    to determine which slide is active (update dot indicators). Do NOT use scroll
 *    event listeners.
 * 6. Product selector: clickable thumbnails below the carousel to switch between products.
 *    Switching resets to slide 0 and restarts autoplay.
 * 7. Keyboard navigation: left/right arrow keys move slides when carousel is focused.
 *
 * Observer management:
 * - You'll need multiple IntersectionObservers with different configs (thresholds, rootMargins).
 *   Think about when to create/destroy them (product switch, component unmount).
 * - Each observer serves a different purpose: lazy loading, active slide detection,
 *   autoplay pause, preloading.
 *
 * Time target: 30 minutes.
 */

import "./ImageCarousel.css";

export const ImageCarousel = () => {
  return <div>Image Carousel</div>;
};
