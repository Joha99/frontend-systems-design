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
 * Time target: 12 minutes.
 */

import { useEffect, useRef, useState } from "react";
import "./LazyImages.css";

const IMAGE_COUNT = 20;

export const LazyImages = () => {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());
  const imageRefs = useRef<Record<number, HTMLDivElement>>({});

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index")!);
          setLoadedIndices((prev) => new Set([...prev, index]));
          observer.unobserve(entry.target);
        }
      });
    });

    Object.values(imageRefs.current).forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      {Array.from({ length: IMAGE_COUNT }, (_, index) => (
        <div
          key={index}
          data-index={index}
          className="image"
          ref={(el) => {
            if (el) {
              imageRefs.current[index] = el;
            }
          }}
        >
          {loadedIndices.has(index) ? (
            <img
              src={`https://picsum.photos/seed/${index}/600/400`}
              alt={`Gallery image ${index + 1}`}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ))}
    </div>
  );
};
