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
 * 2. Selecting a result (click, or ArrowUp/ArrowDown + Enter) adds it to
 *    the watchlist and clears the search. A ticker already in the
 *    watchlist can't be added twice (show it as "Added" or disabled).
 * 3. Each watchlist row shows the symbol, name, latest price, and change
 *    (+/− and %), green when up and red when down since the session open.
 *    Show "Loading…" until the first price arrives.
 * 4. Adding a ticker subscribes to it. Removing it (an × button on the
 *    row) unsubscribes. There must be exactly ONE subscription per ticker
 *    in the watchlist at all times.
 * 5. Updates for one ticker must not overwrite or reset the others.
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
import { getActiveSubscriptionCount, search, subscribe } from "./API";

export const StockWatchlist = () => {
  // TODO: implement
  void [search, subscribe, getActiveSubscriptionCount];

  return (
    <div>
      <h2>Stock Watchlist</h2>
    </div>
  );
};
