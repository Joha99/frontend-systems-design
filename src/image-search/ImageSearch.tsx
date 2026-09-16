/**
 * Image Search Gallery (Tesla-style)
 *
 * Build a search UI that fetches images from a mock API and displays
 * them in a grid with pagination controls.
 *
 * This mirrors the real Tesla interview question: "Create a GUI with
 * a search field, submit button, and image boxes. Integrate with the
 * Giphy API and allow searches. Bonus: paginate the results."
 *
 * Requirements:
 * 1. Search field + submit button. Submitting fetches page 1 of results.
 * 2. Display results in a responsive image grid (3-4 columns).
 * 3. Show a loading state while fetching.
 * 4. Pagination: "Previous" / "Next" buttons + current page / total pages.
 * 5. Handle empty results ("No results found").
 * 6. Handle fetch errors with a retry button.
 * 7. Disable Previous on page 1, Next on last page.
 *
 * Use a mock API instead of a real one. It should accept a search
 * query and page number, simulate network delay, and return a list
 * of image objects (id, url, title) plus a total count.
 *
 * Time target: 25 minutes.
 */

import { useState, type ChangeEvent } from "react";
import styles from "./ImageSearch.module.css";
import { SAMPLE_IMAGES } from "./data";

const MAX_IMAGES_PER_PAGE = 12;

type FetchStatus = "loading" | "success" | "error" | "empty";

interface Image {
  id: number;
  url: string;
  title: string;
}

type Json = () => Promise<{ images: Image[]; total: number }>;

type Response = {
  json: Json;
};

const fetchImages = (query: string, page: number): Promise<Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response: Response = {
        json: () =>
          new Promise((resolve) => {
            const filteredData = [...SAMPLE_IMAGES].filter((image) =>
              image.title.toLowerCase().includes(query.toLowerCase()),
            );

            const window: [number, number] = [
              (page - 1) * MAX_IMAGES_PER_PAGE,
              Math.min(page * MAX_IMAGES_PER_PAGE, filteredData.length),
            ];

            const data = {
              images: filteredData.slice(window[0], window[1]),
              total: filteredData.length,
            };
            return resolve(data);
          }),
      };

      return resolve(response);
    }, 1000);
  });
};

export const ImageSearch = () => {
  const [search, setSearch] = useState<string>("");
  const [images, setImages] = useState<Image[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [page, setPage] = useState(1);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>();

  const totalPages = Math.ceil(totalImages / MAX_IMAGES_PER_PAGE);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const getNewImages = (offset?: number) => {
    const newPage = offset !== undefined ? page + offset : 1;
    setPage(newPage);

    setFetchStatus("loading");
    fetchImages(search, newPage)
      .then((res) => res.json())
      .then((json) => {
        setFetchStatus(json.images.length === 0 ? "empty" : "success");
        setImages(json.images);
        setTotalImages(json.total);
      })
      .catch((err) => {
        setFetchStatus("error");
        console.error(err);
      });
  };

  return (
    <div style={{ width: "100%" }}>
      <h2>Image Search Gallery</h2>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search for an image"
          value={search}
          onChange={onInputChange}
        />
        <button onClick={() => getNewImages()} disabled={search === ""}>
          Submit
        </button>
      </div>

      {fetchStatus === "loading" && <p>Loading images...</p>}
      {fetchStatus === "empty" && <p>No images found.</p>}
      {fetchStatus === "error" && (
        <div>
          <p>Error with loading images. Try again.</p>
        </div>
      )}
      {fetchStatus === "success" && (
        <div className={styles.results}>
          <div className={styles.gallery}>
            {images.map((image) => {
              return (
                <div key={image.id} className={styles.imageContainer}>
                  <img
                    src={image.url}
                    alt={image.title}
                    className={styles.image}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button onClick={() => getNewImages(-1)} disabled={page === 1}>
              Prev
            </button>
            <p>
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => getNewImages(1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
