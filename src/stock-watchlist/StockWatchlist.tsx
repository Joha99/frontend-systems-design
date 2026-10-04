/**
 * Stock Watchlist (reported: Citadel, UI Engineer onsite)
 *
 * "Write a component to add a stock ticker, and subscribe that ticker to a
 * function that periodically updates the price of that stock. You should
 * be able to add/remove/search for a stock ticker."
 *
 * API (see ./API.ts):
 *   search(term)               → Ticker[]   (synchronous, max 10 results)
 *   subscribe(symbol, onUpdate) → unsubscribe()
 *     onUpdate receives { symbol, price, change, changePercent, timestamp }
 *     about every 1–2s.
 *   getActiveSubscriptionCount() → number of open subscriptions
 *
 * Requirements:
 * 1. A search input. As the user types, show matching tickers (symbol,
 *    name, exchange) in a list below it.
 *
 * 2. Selecting a result (click, or ArrowUp/ArrowDown + Enter) adds it to
 *    the watchlist and clears the search. A ticker already in the
 *    watchlist can't be added twice (show it as "Added" or disabled).
 *
 * 3. Each watchlist row shows the symbol, name, latest price, and change
 *    (+/− and %), green when up and red when down since the session open.
 *    Show "Loading…" until the first price arrives.
 *
 * 4. Adding a ticker subscribes to it. Removing it (an × button on the
 *    row) unsubscribes. There must be exactly ONE subscription per ticker
 *    in the watchlist at all times.
 *
 * 5. Updates for one ticker must not overwrite or reset the others.
 *
 * 6. Show getActiveSubscriptionCount() somewhere on screen (a debug line is
 *    fine) and make sure it always equals the watchlist length, including
 *    after removing, re-adding, and remounting.
 *
 * Done when: you add 5 tickers, remove 2, re-add 1, and the subscription
 * count equals the watchlist length the whole time, with prices for every
 * row updating independently.
 *
 * Think about:
 * - Where do subscriptions live: one effect per ticker, one effect for the
 *   whole list, or outside React state entirely? What happens to each
 *   design when the list changes?
 * - The onUpdate callback runs long after it was created. What state does
 *   it need, and how does it avoid stale values? (Functional updates?)
 * - React Strict Mode mounts effects twice in development. Does your
 *   count still come out right?
 *
 * Stretch:
 * - Briefly flash a row's price green/red when it ticks up/down.
 * - Sort the watchlist by symbol, price, or % change.
 * - Persist the watchlist to localStorage and resubscribe on load.
 * - Pause/resume a single ticker's updates.
 *
 * Time target: 45 minutes.
 */

import styles from "./StockWatchlist.module.css";
import {
  getActiveSubscriptionCount,
  search,
  subscribe,
  type PriceUpdate,
  type Ticker,
} from "./API";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

type WatchlistItem = PriceUpdate &
  Pick<Ticker, "name"> & {
    isLoading: boolean;
  };
type WatchlistMap = Record<PriceUpdate["symbol"], WatchlistItem>;
type UnsubscribeMap = Record<PriceUpdate["symbol"], () => void>;

export const StockWatchlist = () => {
  const [searchValue, setSearchValue] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistMap>({});
  const [filteredList, setFilteredList] = useState<Ticker[]>([]);
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);

  const unsubscribeMap = useRef<UnsubscribeMap>({});

  useEffect(() => {
    setSubscriptionCount(getActiveSubscriptionCount());

    return () => {
      if (Object.values(unsubscribeMap.current).length > 0) {
        for (const fn of Object.values(unsubscribeMap.current)) {
          fn();
        }
      }
      setSubscriptionCount(0);
    };
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    const list = search(input);

    setFilteredList(list);
    setSearchValue(input);
  };

  const onSubscribeToTicker = (ticker: Ticker) => {
    setWatchlist((prev) => {
      const newWatchlist = { ...prev };
      newWatchlist[ticker.symbol] = {
        name: ticker.name,
        symbol: ticker.symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        timestamp: 0,
        isLoading: true,
      };
      return newWatchlist;
    });

    const unsubscribe = subscribe(ticker.symbol, (update: PriceUpdate) => {
      setWatchlist((prev) => {
        const newWatchlist = { ...prev };
        newWatchlist[ticker.symbol] = {
          name: ticker.name,
          isLoading: false,
          ...update,
        };
        return newWatchlist;
      });
    });

    unsubscribeMap.current[ticker.symbol] = unsubscribe;
    setSubscriptionCount(getActiveSubscriptionCount());
    setFilteredList([]);
    setSearchValue("");
  };

  const onUnsubscribeToTicker = (ticker: WatchlistItem) => {
    const unsubscribeFn = unsubscribeMap.current[ticker.symbol];

    if (unsubscribeFn) {
      unsubscribeFn();

      delete unsubscribeMap.current[ticker.symbol];
      setWatchlist((prev) => {
        const { [ticker.symbol]: _, ...rest } = prev;
        return rest;
      });

      setSubscriptionCount(getActiveSubscriptionCount());
    }
  };

  const watchlistArray = Object.values(watchlist);

  return (
    <div className={styles.grid}>
      <div className={styles["content-wrapper"]}>
        <h3>Search for stocks</h3>
        <div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onInputChange(e)}
            placeholder="Search"
          />
          {filteredList.length > 0 && (
            <ul className={styles.dropdown}>
              {filteredList.map((ticker) => {
                const { symbol, name } = ticker;
                const isInWatchlist = watchlist[symbol] !== undefined;

                return (
                  <li key={symbol}>
                    <button
                      className={styles["list-item"]}
                      onClick={() => onSubscribeToTicker(ticker)}
                      disabled={isInWatchlist}
                    >
                      <span>[{symbol}]</span>
                      <span>{name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className={styles["content-wrapper"]}>
        <h3>Your watchlist ({subscriptionCount})</h3>
        {watchlistArray.length > 0 && (
          <table className={styles.watchlist}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change</th>
                <th>Change %</th>
              </tr>
            </thead>
            <tbody>
              {watchlistArray.map((ticker) => {
                const {
                  symbol,
                  name,
                  price,
                  change,
                  changePercent,
                  isLoading,
                } = ticker;
                if (isLoading) {
                  return null;
                }

                return (
                  <tr
                    key={symbol}
                    style={{
                      backgroundColor:
                        change > 0
                          ? "#d3ffd3"
                          : change < 0
                            ? "#ffd3d3"
                            : undefined,
                    }}
                  >
                    <td>
                      <button onClick={() => onUnsubscribeToTicker(ticker)}>
                        🅧
                      </button>
                      {symbol}
                    </td>
                    <td>{name}</td>
                    <td>{price}</td>
                    <td>{change}</td>
                    <td>{changePercent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
