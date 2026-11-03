/**
 * Car search results (API call + render). 45 minutes, timed. Plan out loud
 * for 3–5 minutes first.
 *
 * The fake server is in `carApi.ts` (read its header; don't edit it).
 * To run: render <CarSearch /> in `src/App.tsx`, then `npm run dev`.
 *
 * Part 1 (~20 min): load and render
 * 1. On mount, call `searchCars()` and render the cars as a grid of cards:
 *    "2021 Toyota RAV4", city, price per day ("$84/day"), and rating with
 *    trip count ("4.8 · 120 trips"). A car with no trips shows "New".
 * 2. Loading state on first load (no layout jump when the cards arrive).
 * 3. Error state with a Retry button.
 * 4. Empty state.
 *
 * Part 2 (~15 min): filters
 * 5. A "Make" select (options from `getMakes()`, plus "Any") and a
 *    "Max price per day" number input. Changing either reloads page 1.
 * 6. Responses arrive out of order: the results must always match the
 *    filters currently shown. Typing "1", "15", "150" fast must not end up
 *    showing results for "15".
 *
 * Part 3 (~10 min): load more
 * 7. A "Load more" button appends the next page (`nextCursor`). Hide it on
 *    the last page. No duplicate cars, no double request on a double click.
 * 8. If loading more fails, keep the cars already shown and show an inline
 *    retry next to the button (not the full-page error).
 */

import { createElement, useEffect, useRef, useState } from "react";
import {
  searchCars,
  getMakes,
  type Car,
  type SearchResponse,
  type SearchParams,
} from "./carApi";
import styles from "./CarSearch.module.css";

const FILTER_DEBOUNCE_MS = 300;

type FetchStatus = "loading" | "success" | "error";
type CarMap = Map<Car["id"], Car>;
type Filters = {
  make?: string;
  maxPricePerDay?: Car["pricePerDay"];
};

const CarCard = ({ car }: { car: Car }) => {
  const { make, model, year, pricePerDay, rating, trips, city } = car;

  return (
    <div className={styles.card}>
      <h3 className={styles["card-header"]}>
        {model} {make}
      </h3>
      <div className={styles["card-description"]}>
        <span>{year}</span>
        <span>{city}</span>
        <span>{rating}★</span>
        {trips === 0 ? (
          <span className={styles["new-badge"]}>New</span>
        ) : (
          <span>{`(${trips})`}</span>
        )}
      </div>
      <div className={styles["card-footer"]}>
        <span>
          <span className={styles.price}>${pricePerDay}</span>/day
        </span>
      </div>
    </div>
  );
};

export const CarSearch = () => {
  const [initialFetchStatus, setInitialFetchStatus] = useState<FetchStatus>();
  const [loadMoreStatus, setLoadMoreStatus] = useState<FetchStatus>();
  const [cars, setCars] = useState<CarMap>(new Map());
  const [makes, setMakes] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});

  const cursor = useRef<SearchResponse["nextCursor"]>(null);

  const carList = Array.from(cars.values());

  useEffect(() => {
    const carsPromise = searchCars();
    const makesPromise = getMakes();

    setInitialFetchStatus("loading");
    Promise.all([carsPromise, makesPromise])
      .then(([carsRes, makesRes]) => {
        const newCarMap: CarMap = new Map();
        for (const car of carsRes.cars) {
          newCarMap.set(car.id, car);
        }

        setMakes(makesRes);
        setCars(newCarMap);
        setInitialFetchStatus("success");
        cursor.current = carsRes.nextCursor;
      })
      .catch((err) => {
        console.error(err);
        setInitialFetchStatus("error");
      });
  }, []);

  useEffect(() => {
    if (filters.make === undefined && filters.maxPricePerDay === undefined) {
      return;
    }

    const searchParams: SearchParams = {
      make: filters.make,
      maxPrice: filters.maxPricePerDay,
    };

    const timeoutId = setTimeout(() => {
      searchCars(searchParams)
        .then((searchResponse) => {
          const newCarMap: CarMap = new Map();
          for (const car of searchResponse.cars) {
            newCarMap.set(car.id, car);
          }
          setCars(newCarMap);
          cursor.current = searchResponse.nextCursor;
        })
        .catch((err) => {
          console.error(err);
        });
    }, FILTER_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filters]);

  const fetchCars = (searchParams?: SearchParams) => {
    searchCars(searchParams)
      .then((searchResponse) => {
        const newCarMap: CarMap = new Map();
        for (const car of searchResponse.cars) {
          newCarMap.set(car.id, car);
        }

        setCars((prev) => new Map([...prev, ...newCarMap]));
        cursor.current = searchResponse.nextCursor;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onLoadMore = () => {
    const searchParams: SearchParams = {
      make: filters.make,
      maxPrice: filters.maxPricePerDay,
      cursor: cursor.current,
    };

    fetchCars(searchParams);
  };

  const onRetry = () => {};

  if (initialFetchStatus === "error") {
    return (
      <div>
        Couldn't load cars. <button onClick={() => fetchCars()}>Retry</button>
      </div>
    );
  }

  if (initialFetchStatus === "loading") {
    return <div>Fetching cars...</div>;
  }

  console.log("nextcursor", cursor.current);

  return (
    <div className={styles.app}>
      <h2>Car Search</h2>
      {carList.length === 0 && <p>There are no available cars.</p>}
      {carList.length > 0 && (
        <>
          {/* Filters bar */}
          <div className={styles.filterbar}>
            <div>
              <select
                id="make"
                name="make"
                value={filters.make ?? ""}
                onChange={(e) => {
                  const newMake = e.target.value;
                  setFilters({ ...filters, make: newMake });
                }}
                className={styles.select}
              >
                <button>
                  <small>Make</small>
                  <div>
                    {createElement("selectedcontent")}
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="m7 10l5 5l5-5z" />
                    </svg>
                  </div>
                </button>
                <option value="">Any</option>
                {makes.map((make) => {
                  return (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.filter}>
              <label>Max price per day</label>
              <input
                type="number"
                value={filters.maxPricePerDay ?? ""}
                onChange={(e) => {
                  const newMaxPricePerDay = Number.parseInt(
                    e.currentTarget.value,
                  );
                  setFilters({ ...filters, maxPricePerDay: newMaxPricePerDay });
                }}
              />
            </div>
          </div>

          {/* Cars grid */}
          <div className={styles.grid}>
            {carList.map((car) => {
              return <CarCard key={car.id} car={car} />;
            })}
          </div>

          <div>
            <button onClick={onLoadMore}>Load more</button>
          </div>
        </>
      )}
    </div>
  );
};
