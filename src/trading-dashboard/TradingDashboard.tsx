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

const LIMIT = 100;
const REFRESH_INTERVAL = 1000;

interface Statistic {
  tradeCount: number;
  totalVolumn: number;
  vwap: number;
  // latestBid: number;
}

export const TradingDashboard = () => {
  const [dashboardStatus, setDashboardStatus] = useState<"pause" | "resume">(
    "resume",
  );
  const dashboardStatusRef = useRef<"pause" | "resume">("resume");

  const [quotes, setQuotes] = useState<QuoteEvent[]>([]);
  const [buyTrades, setBuyTrades] = useState<TradeEvent[]>([]);
  const [sellTrades, setSellTrades] = useState<TradeEvent[]>([]);

  const batchedQuotesRef = useRef<QuoteEvent[]>([]);
  const batchedBuysRef = useRef<TradeEvent[]>([]);
  const batchedSellsRef = useRef<TradeEvent[]>([]);

  // Stats cover every trade that occured in the last 30 seconds
  const recentBuysRef = useRef<TradeEvent[]>([]);
  const recentSellsRef = useRef<TradeEvent[]>([]);
  const [buyStats, setBuyStats] = useState<Statistic>();
  const [sellStats, setSellStats] = useState<Statistic>();

  const unsubscribeFnRef = useRef<() => void>(() => {});

  useEffect(() => {
    unsubscribeFnRef.current = subscribeToEvents(streamEvents);

    const intervalId = setInterval(() => {
      updateLists();
    }, REFRESH_INTERVAL);

    return () => {
      unsubscribeFnRef.current();
      clearInterval(intervalId);
    };
  }, []);

  const sortByTimestamp = (list: MarketEvent[]) => {
    list.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
  };

  const streamEvents = (event: MarketEvent) => {
    if (event.type === "quote") {
      batchedQuotesRef.current.push(event);
    }

    if (event.type === "trade") {
      if (event.side === "buy") {
        batchedBuysRef.current.push(event);
        recentBuysRef.current.push(event);
      }

      if (event.side === "sell") {
        batchedSellsRef.current.push(event);
        recentSellsRef.current.push(event);
      }
    }
  };

  const mergeSortedEvents = (
    prevState: MarketEvent[],
    batchList: MarketEvent[],
    limit: number = LIMIT,
  ): MarketEvent[] => {
    const newList = [];

    let p = 0;
    let q = 0;

    while (
      newList.length < limit &&
      p < prevState.length &&
      q < batchList.length
    ) {
      const currQuote = prevState[p];
      const newQuote = batchList[q];

      if (currQuote.timestamp > newQuote.timestamp) {
        newList.push(currQuote);
        p++;
      } else {
        newList.push(newQuote);
        q++;
      }
    }

    while (newList.length < limit && p < prevState.length) {
      newList.push(prevState[p]);
      p++;
    }

    while (newList.length < limit && q < batchList.length) {
      newList.push(batchList[q]);
      q++;
    }

    return newList;
  };

  const getStatistic = (list: TradeEvent[]): Statistic => {
    const tradeCount = list.length;

    let totalVolumn = 0;
    let totalCost = 0;

    for (const event of list) {
      totalVolumn += event.quantity;
      totalCost += event.price * event.quantity;
    }

    const vwap = totalCost / totalVolumn;

    return {
      tradeCount,
      totalVolumn,
      vwap,
    };
  };

  const updateLists = () => {
    // Filter out events that didn't occur within last 30s for lists used to calculate stats
    const now = Date.now();
    recentBuysRef.current = recentBuysRef.current.filter(
      (event) => now - event.timestamp <= 30000,
    );
    recentSellsRef.current = recentSellsRef.current.filter(
      (event) => now - event.timestamp <= 30000,
    );

    // If dashboard is paused, don't update the rendered lists
    if (dashboardStatusRef.current === "pause") return;

    // Update the rendered stats
    setBuyStats(getStatistic(recentBuysRef.current));
    setSellStats(getStatistic(recentSellsRef.current));

    // Sort the batches that need to be added to the rendered states
    const batchedQuotes = [...batchedQuotesRef.current];
    sortByTimestamp(batchedQuotes);
    const batchedSells = [...batchedSellsRef.current];
    sortByTimestamp(batchedSells);
    const batchedBuys = [...batchedBuysRef.current];
    sortByTimestamp(batchedBuys);

    // Merge the sorted batches into the rendered states
    setQuotes((prev) => {
      return mergeSortedEvents(prev, batchedQuotes) as QuoteEvent[];
    });
    setSellTrades((prev) => {
      return mergeSortedEvents(prev, batchedSells) as TradeEvent[];
    });
    setBuyTrades((prev) => {
      return mergeSortedEvents(prev, batchedBuys) as TradeEvent[];
    });

    // Reset the refs holding the batches
    batchedQuotesRef.current = [];
    batchedSellsRef.current = [];
    batchedBuysRef.current = [];
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
          <ul>
            {quotes.map((quote) => {
              const time = new Date(quote.timestamp).toLocaleString();

              return (
                <li key={quote.id}>
                  {time} | [{quote.symbol}]
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3>Buy Trades ({buyTrades.length})</h3>
          {buyStats && (
            <div>
              <h4>Buy stats over buy trades over last 30 seconds</h4>
              <ul>
                <li>TRADE COUNT: {buyStats.tradeCount}</li>
                <li>TRADE VOLUMN: {buyStats.totalVolumn}</li>
                <li>VWAP: {buyStats.vwap}</li>
              </ul>
            </div>
          )}
          <ul>
            {buyTrades.map((trade) => {
              const time = new Date(trade.timestamp).toLocaleString();

              return (
                <li key={trade.id}>
                  {time} | [{trade.symbol}]
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3>Sell Trades ({sellTrades.length})</h3>
          {sellStats && (
            <div>
              <h4>Sell stats over sell trades over last 30 seconds</h4>
              <ul>
                <li>TRADE COUNT: {sellStats.tradeCount}</li>
                <li>TRADE VOLUMN: {sellStats.totalVolumn}</li>
                <li>VWAP: {sellStats.vwap}</li>
              </ul>
            </div>
          )}
          <ul>
            {sellTrades.map((trade) => {
              const time = new Date(trade.timestamp).toLocaleString();

              return (
                <li key={trade.id}>
                  {time} | [{trade.symbol}]
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
