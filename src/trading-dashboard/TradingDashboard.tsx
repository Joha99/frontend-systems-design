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
 *
 * 4. Statistics over the latest 30 seconds, per side (buy / sell):
 *    trade count, total volume (sum of quantity), and VWAP
 *    (sum(price × quantity) / sum(quantity)). Also the latest bid/ask per
 *    symbol from quotes.
 *    The window must slide with time: stats change as old trades fall out,
 *    even if no new events arrive.
 *
 * 5. Pause / Resume button:
 *    - While paused, the lists and stats on screen stop changing.
 *    - No events are lost: on Resume, everything that arrived while paused
 *      appears, and stats include it.
 *    - Show how many events arrived while paused ("12 new events").
 *
 * 6. Bursts must not freeze the page: 40 events arriving at once should
 *    cause one re-render, not 40.
 *
 * Done when: the dashboard runs for 2 minutes with lists capped at 100,
 * stats match a hand check on a paused snapshot, and pausing for 10s then
 * resuming shows the missed events in the right order.
 */

import styles from "./TradingDashboard.module.css";
import {
  getActiveSubscriptionCount,
  type MarketEvent,
  subscribeToEvents,
  type QuoteEvent,
  type TradeEvent,
} from "./API";
import { useEffect, useRef, useState } from "react";

const LIMIT = 20;
const REFRESH_INTERVAL = 1000;

export const TradingDashboard = () => {
  const [dashboardStatus, setDashboardStatus] = useState<"pause" | "resume">(
    "resume",
  );
  const dashboardStatusRef = useRef<"pause" | "resume">("resume");

  const [quotes, setQuotes] = useState<QuoteEvent[]>([]);
  const [buyTrades, setBuyTrades] = useState<TradeEvent[]>([]);
  const [sellTrades, setSellTrades] = useState<TradeEvent[]>([]);

  const quotesRef = useRef<QuoteEvent[]>([]);
  const buyTradesRef = useRef<TradeEvent[]>([]);
  const sellTradesRef = useRef<TradeEvent[]>([]);

  const unsubscribeFnRef = useRef<() => void>(() => {});

  useEffect(() => {
    unsubscribeFnRef.current = subscribeToEvents(streamEvents);

    const intervalId = setInterval(() => {
      updateLists();
    }, REFRESH_INTERVAL);

    () => {
      unsubscribeFnRef.current();
      clearInterval(intervalId);
    };
  }, []);

  const sortByTimestamp = (list: MarketEvent[]) => {
    list.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
  };

  const streamEvents = (event: MarketEvent) => {
    console.log("NEW MARKET EVENT", event);

    if (event.type === "quote") {
      quotesRef.current.push(event);
    }

    if (event.type === "trade") {
      if (event.side === "buy") {
        buyTradesRef.current.push(event);
      }

      if (event.side === "sell") {
        sellTradesRef.current.push(event);
      }
    }
  };

  const updateLists = () => {
    if (dashboardStatusRef.current === "pause") return;
    const batchedQuotes = [...quotesRef.current];
    const batchedSells = [...sellTradesRef.current];
    const batchedBuys = [...buyTradesRef.current];

    setQuotes((prev) => {
      const newQuotes = [...prev, ...batchedQuotes];
      sortByTimestamp(newQuotes);
      return newQuotes.slice(0, 100);
    });

    setSellTrades((prev) => {
      const newSellTrades = [...prev, ...batchedSells];
      sortByTimestamp(newSellTrades);
      return newSellTrades.slice(0, 100);
    });
    setBuyTrades((prev) => {
      const newBuyTrades = [...prev, ...batchedBuys];
      sortByTimestamp(newBuyTrades);
      return newBuyTrades.slice(0, 100);
    });

    quotesRef.current = [];
    sellTradesRef.current = [];
    buyTradesRef.current = [];
  };

  const updateDashboardStatus = (status: "pause" | "resume") => {
    setDashboardStatus(status);
    dashboardStatusRef.current = status;
  };

  const onPause = () => {
    updateDashboardStatus("pause");
  };

  const onResume = () => {
    updateDashboardStatus("resume");
  };

  return (
    <div style={{ width: "100%" }}>
      <h2>Real-Time Trading Dashboard</h2>
      <div>
        <button
          onClick={onPause}
          className={`${dashboardStatus === "pause" ? styles.activeStatus : ""}`}
        >
          Pause
        </button>
        <button
          onClick={onResume}
          className={`${dashboardStatus === "resume" ? styles.activeStatus : ""}`}
        >
          Resume
        </button>
      </div>
      <div className={styles.grid}>
        <div>
          <h3>Quotes ({quotes.length})</h3>
          {/* TODO: render stats over last 30 sec */}
          <ul>
            {quotes.map((quote) => {
              return (
                <li key={quote.id}>
                  {quote.id} [{quote.symbol}] | {quote.timestamp}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3>Buy Trades ({buyTrades.length})</h3>
          {/* TODO: render stats over last 30 sec */}
          <ul>
            {buyTrades.map((trade) => {
              return (
                <li key={trade.id}>
                  {trade.id} [{trade.symbol}] | {trade.timestamp}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3>Sell Trades ({sellTrades.length})</h3>
          {/* TODO: render stats over last 30 sec */}
          <ul>
            {sellTrades.map((trade) => {
              return (
                <li key={trade.id}>
                  {trade.id} [{trade.symbol}] | {trade.timestamp}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
