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
 * 3. Lazy loading: only load images for slides that are visible or the
 *    next slide over. Show a skeleton placeholder until the image has
 *    actually finished loading. Once loaded, an image stays loaded.
 * 4. Active slide detection: figure out which slide is active using
 *    IntersectionObserver, NOT scroll event listeners. The dots and the
 *    arrow disabled states follow it, no matter how the user moved
 *    (arrows, dots, swipe, keyboard).
 * 5. Autoplay: advance one slide every 4 seconds, wrapping from the last
 *    slide back to the first. Pause while:
 *    - the user hovers over the carousel, or
 *    - the carousel is not fully visible in the viewport.
 *    Any manual navigation resets the 4s countdown.
 * 6. Product selector: clickable thumbnails below the carousel. Switching
 *    products jumps to slide 0 (no smooth scroll) and restarts autoplay.
 *    The selected thumbnail is highlighted.
 */

import { useEffect, useRef, useState } from "react";
import "./ImageCarousel.css";

const API_URL =
  "https://dummyjson.com/products?limit=5&skip=166&select=title,images,thumbnail";
const AUTOPLAY_MS = 4000;
const CAROUSEL_WIDTH = 640;

export interface Product {
  id: number;
  title: string;
  images: string[];
  thumbnail: string;
}

type Fetch = "loading" | "success" | "error";

export const ImageCarousel = () => {
  const [products, setProducts] = useState<Record<Product["id"], Product>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product["id"]>();

  const [slide, setSlide] = useState<number>(0);
  const [manualSlideChange, setManualSlideChange] = useState<number>(0);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(
    new Set<number>(),
  ); // added if active slide or nearby slides, reset when product is changed

  const [hovered, setHovered] = useState<boolean>();
  const [fetchStatus, setFetchStatus] = useState<Fetch>("loading");

  const slidesRef = useRef<Record<number, HTMLDivElement>>({});
  const carouselRef = useRef<HTMLDivElement>(null);

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
        setSelectedProduct(data.products[0].id);
        setFetchStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setFetchStatus("error");
      });
  }, []);

  // for setting the active slide state depending on scroll of carousel track
  useEffect(() => {
    if (selectedProduct === undefined) return;

    const options = {
      root: carouselRef.current,
      threshold: 0.6,
    };

    // detects how much the track has scrolled and sets the slide accordingly
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const matchingSlide = Object.entries(slidesRef.current).find(
            (value) => value[1] === entry.target,
          );
          setSlide(parseInt(matchingSlide![0]));
        }
      });
    }, options);

    Object.values(slidesRef.current).forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedProduct]);

  // for preloading nearby slide images
  useEffect(() => {
    const options = {
      root: carouselRef.current,
      rootMargin: "0px 10px", // extends the detection area of the root
      threshold: 0,
    };

    // every time a slide changes, we need to preload the slide next to it
    // the entries here include the visible slide and the nearby slides
    const observer = new IntersectionObserver((entries) => {
      const preloadedSlideIds: number[] = [];

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const matchingSlide = Object.entries(slidesRef.current).find(
            (value) => value[1] === entry.target,
          );
          preloadedSlideIds.push(parseInt(matchingSlide![0]));
        }
      });

      setPreloadedSlides((prev) => new Set([...prev, ...preloadedSlideIds]));
    }, options);

    Object.values(slidesRef.current).forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [slide, selectedProduct]);

  useEffect(() => {
    if (hovered) return;

    const intervalId = setInterval(() => {
      if (!carouselRef.current) return;

      // manually scroll the scroll container
      const { scrollLeft, scrollWidth } = carouselRef.current;

      if (scrollLeft + CAROUSEL_WIDTH >= scrollWidth) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({
          left: CAROUSEL_WIDTH,
          behavior: "smooth",
        });
      }
    }, AUTOPLAY_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [hovered, manualSlideChange]); // whenever we hover over carousel or a user makes a manual slide change, we reset the timer

  // On manual slide change, we programmically set the scroll position to show the correct product slide.
  // The intersection observer picks up this scroll position change and sets the slide state.
  const onSlideChange = (offset: number) => {
    if (!carouselRef.current) return;

    const newSlide = slide + offset;
    carouselRef.current.scrollTo({
      left: newSlide * CAROUSEL_WIDTH,
    });
    setManualSlideChange((prev) => prev + 1);
  };

  const onProductChange = (id: Product["id"]) => {
    if (!carouselRef.current) return;

    setSelectedProduct(id);
    setPreloadedSlides(new Set<number>());
    carouselRef.current.scrollTo({
      left: 0,
    });
    setManualSlideChange((prev) => prev + 1);
  };

  if (fetchStatus === "loading") {
    return <p>Loading...</p>;
  }

  if (fetchStatus === "error") {
    return <p>There was an issue retrieving the products.</p>;
  }

  if (selectedProduct === undefined || !products[selectedProduct]) {
    return <p>There are no products.</p>;
  }

  const selectedProductSlides = products[selectedProduct].images;
  return (
    <div className="carousel-page">
      <div className="carousel">
        <div
          className="carousel-track"
          ref={carouselRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            className="carousel-arrow prev"
            disabled={slide === 0}
            onClick={() => onSlideChange(-1)}
          >
            PREV
          </button>
          {selectedProductSlides.map((img, i) => {
            const isPreloaded = preloadedSlides.has(i);

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
                {isPreloaded ? (
                  <img
                    src={img}
                    alt={`Product image of ${products[selectedProduct].title}`}
                  />
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            );
          })}
          <button
            className="carousel-arrow next"
            disabled={slide === selectedProductSlides.length - 1}
            onClick={() => onSlideChange(1)}
          >
            NEXT
          </button>
        </div>
        <div className="carousel-dots">
          {Array.from({ length: selectedProductSlides.length }, (_, i) => {
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
