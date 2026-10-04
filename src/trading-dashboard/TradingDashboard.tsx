/**
 * Real-Time Trading Dashboard (reported: Citadel, phone screen)
 *
 * Build a live dashboard on top of a provided market event stream.
 * CSS and visual polish are out of scope; correctness and data flow are
 * what's being tested.
 *
 * API (see ./API.ts):
 *   subscribeToEvents(onEvent) → unsubscribe()
 *     Events are either
 *       { type: "quote", symbol, bid, ask, timestamp, id }
 *       { type: "trade", side: "buy" | "sell", symbol, price, quantity,
 *         timestamp, id }
 *     ~5–15 per second, plus bursts of 20–40 at once. About 5% arrive late
 *     (timestamp up to 2s in the past).
 *   getActiveSubscriptionCount() → number of open subscriptions
 *
 * Requirements:
 * 1. Subscribe on mount, unsubscribe on unmount (exactly one subscription).
 * 2. Show three lists side by side: Quotes, Buy trades, Sell trades.
 *    Each shows the NEWEST events first, by timestamp (not arrival
 *    order: late events go where their timestamp belongs).
 * 3. Keep memory bounded: each list keeps at most the latest 100 events.
 * 4. Statistics over the latest 30 seconds, per side (buy / sell):
 *    trade count, total volume (sum of quantity), and VWAP
 *    (sum(price × quantity) / sum(quantity)). Also the latest bid/ask per
 *    symbol from quotes.
 *    The window must slide with time: stats change as old trades fall out,
 *    even if no new events arrive.
 * 5. Pause / Resume button:
 *    - While paused, the lists and stats on screen stop changing.
 *    - No events are lost: on Resume, everything that arrived while paused
 *      appears, and stats include it.
 *    - Show how many events arrived while paused ("12 new events").
 * 6. Bursts must not freeze the page: 40 events arriving at once should
 *    cause one re-render, not 40.
 *
 * Done when: the dashboard runs for 2 minutes with lists capped at 100,
 * stats match a hand check on a paused snapshot, and pausing for 10s then
 * resuming shows the missed events in the right order.
 *
 * Think about:
 * - Where do incoming events go before they're shown: state, or a ref
 *   that a timer flushes into state? How does that help with bursts AND
 *   with pause?
 * - Your onEvent callback is created once, at subscribe time. What does it
 *   see when `paused` changes later?
 * - Stats over "the last 30 seconds": what data structure lets you drop
 *   old trades cheaply as time moves on? (Sliding window.)
 *
 * Stretch:
 * - Filter everything by symbol.
 * - A tiny sparkline of trade price for the selected symbol.
 * - Highlight trades larger than 400 shares.
 *
 * Time target: 60 minutes.
 */

import styles from "./TradingDashboard.module.css";
import { getActiveSubscriptionCount, subscribeToEvents } from "./API";

export const TradingDashboard = () => {
  // TODO: implement
  void [subscribeToEvents, getActiveSubscriptionCount];

  return (
    <div>
      <h2>Real-Time Trading Dashboard</h2>
    </div>
  );
};
