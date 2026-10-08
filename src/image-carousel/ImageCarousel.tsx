/**
 * Image Carousel with Lazy Loading + Autoplay
 *
 * Build an image carousel like Instagram's post carousel or a product
 * image gallery: lazy loading, autoplay, dot indicators, keyboard support.
 *
 * API: GET https://dummyjson.com/products?limit=5&skip=166&select=title,images,thumbnail
 * Response: { products: [{ id, title, images: [url, ...], thumbnail }], total, skip, limit }
 * (skip=166 returns 5 products with 6 images each.)
 *
 * Requirements:
 * 1. Fetch the 5 products on mount. Show one product at a time as a
 *    horizontal carousel of its images (one image per slide, full width).
 *    Handle loading and error states.
 * 2. Carousel mechanics: CSS scroll-snap on a horizontal overflow container.
 *    Prev / Next arrow buttons on the sides (disabled at the ends).
 *    Dot indicators below: the active dot is highlighted, and clicking a
 *    dot scrolls to that slide. Swiping / trackpad-scrolling must also work.
 *
 * 3. Lazy loading: only load images for slides that are visible or the
 *    next slide over. Show a skeleton placeholder until the image has
 *    actually finished loading. Once loaded, an image stays loaded.
 *
 * 4. Active slide detection: figure out which slide is active using
 *    IntersectionObserver, NOT scroll event listeners. The dots and the
 *    arrow disabled states follow it, no matter how the user moved
 *    (arrows, dots, swipe, keyboard).
 *
 * 5. Autoplay: advance one slide every 4 seconds, wrapping from the last
 *    slide back to the first. Pause while:
 *    - the user hovers over the carousel, or
 *    - the carousel is not fully visible in the viewport.
 *    Any manual navigation resets the 4s countdown.
 *
 * 6. Product selector: clickable thumbnails below the carousel. Switching
 *    products jumps to slide 0 (no smooth scroll) and restarts autoplay.
 *    The selected thumbnail is highlighted.
 *
 * 7. Keyboard: Left / Right arrow keys move slides when the carousel has
 *    focus. Each slide's image has meaningful alt text ("<title>, image 2 of 6").
 *
 * Done when: you can swipe, click arrows/dots, and use the keyboard and the
 * dots always stay in sync; the Network tab shows only the current + next
 * image requested; autoplay stops when you hover or scroll the carousel
 * half off-screen; switching products causes no stale observers or timers.
 *
 * Think about:
 * - You'll need several IntersectionObservers with different configs
 *   (threshold, rootMargin, root). Which ones observe the slides, which one
 *   observes the whole carousel, and what should `root` be for each?
 * - The slides are new DOM nodes when the product changes. When do your
 *   observers need to be torn down and recreated?
 * - Autoplay is driven by a timer, but the "current slide" comes from an
 *   observer callback. How does the timer read the latest value?
 *
 * Stretch:
 * - Respect `prefers-reduced-motion`: no autoplay, no smooth scrolling.
 * - A play / pause button for autoplay (required for accessibility, WCAG 2.2.2).
 * - Announce "Slide 3 of 6" with an aria-live region.
 *
 * Time target: 45 minutes.
 */

import { useEffect, useRef, useState } from "react";
import "./ImageCarousel.css";

const API_URL =
  "https://dummyjson.com/products?limit=5&skip=166&select=title,images,thumbnail";
const AUTOPLAY_MS = 4000;

export interface Product {
  id: number;
  title: string;
  images: string[];
  thumbnail: string;
}

type Fetch = "loading" | "success" | "error";

export const ImageCarousel = () => {
  const [fetchStatus, setFetchStatus] = useState<Fetch>();
  const [products, setProducts] = useState<Record<Product["id"], Product>>({});
  const [selected, setSelected] = useState<Product["id"]>();
  const [slide, setSlide] = useState<number>();

  const slidesRef = useRef<Record<number, HTMLDivElement>>({});

  useEffect(() => {
    setFetchStatus("loading");
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const newProducts: Record<Product["id"], Product> = {};
        (data.products as Product[]).reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, newProducts);
        setProducts(newProducts);
        setSelected(data.products[0].id);
        setSlide(0);
        setFetchStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setFetchStatus("error");
      });
  }, []);

  useEffect(() => {
    if (slide === undefined) return;
    const newSlideElement = slidesRef.current[slide];
    newSlideElement.scrollIntoView({
      behavior: "smooth",
    });
  }, [slide]);

  useEffect(() => {
    if (selected === undefined) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matchingSlide = Object.entries(slidesRef.current).find(
              (value) => value[1] === entry.target,
            );
            setSlide(parseInt(matchingSlide![0]));
          }
        });
      },
      {
        threshold: 1,
      },
    );

    Object.values(slidesRef.current).forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [selected]);

  const onSlideChange = (offset: number) => {
    if (slide === undefined) return;
    setSlide(slide + offset);
  };

  const onProductChange = (id: Product["id"]) => {
    setSelected(id);
    setSlide(0);
  };

  if (fetchStatus === "loading") {
    return <p>Loading...</p>;
  }

  if (fetchStatus === "error") {
    return <p>There was an issue retrieving the products.</p>;
  }

  const selectedImages =
    selected === undefined ? [] : products[selected].images;

  return (
    <div className="carousel-page">
      <div className="carousel">
        <div className="carousel-track">
          <button
            className="carousel-arrow prev"
            disabled={slide === 0}
            onClick={() => onSlideChange(-1)}
          >
            PREV
          </button>
          {selectedImages.map((img, i) => {
            return (
              <div
                key={img}
                className="carousel-slide"
                ref={(el) => {
                  if (el) {
                    slidesRef.current[i] = el;
                  }
                }}
              >
                <img key={img} src={img} />
              </div>
            );
          })}
          <button
            className="carousel-arrow next"
            disabled={slide === selectedImages.length - 1}
            onClick={() => onSlideChange(1)}
          >
            NEXT
          </button>
        </div>
        <div className="carousel-dots">
          {Array.from({ length: selectedImages.length }, (_, i) => {
            const isSelected = slide === i;

            return (
              <button
                key={i}
                className={`carousel-dot ${isSelected ? "selected" : ""}`}
                onClick={() => onSlideChange(i - slide)}
              />
            );
          })}
        </div>
      </div>

      <div className="carousel-thumbnails">
        {Object.values(products).map((product) => {
          return (
            <button
              key={product.id}
              onClick={() => onProductChange(product.id)}
            >
              <img src={product.thumbnail} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
