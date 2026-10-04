/**
 * Simulated market event stream (a local module standing in for a
 * websocket feed).
 *
 * - subscribeToEvents(onEvent): pushes market events (~5–15 per second,
 *   with occasional bursts) until you call the returned unsubscribe.
 * - getActiveSubscriptionCount(): how many subscriptions are still open.
 *
 * Realistic quirks, on purpose:
 * - About 5% of events arrive LATE: their timestamp is up to 2 seconds in
 *   the past, so arrival order is not always timestamp order.
 * - Every few seconds a burst of 20–40 events arrives at once.
 */

export type Side = "buy" | "sell";

export interface QuoteEvent {
  id: string;
  type: "quote";
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number; // ms since epoch
}

export interface TradeEvent {
  id: string;
  type: "trade";
  side: Side;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number; // ms since epoch
}

export type MarketEvent = QuoteEvent | TradeEvent;

export const SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"] as const;

const mids: Record<string, number> = {
  AAPL: 228.5,
  MSFT: 430.6,
  NVDA: 121.4,
  TSLA: 250.1,
  AMZN: 186.2,
};

let nextId = 1;
let activeSubscriptions = 0;

const round = (n: number) => Math.round(n * 100) / 100;
const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

function makeEvent(): MarketEvent {
  const symbol = pick(SYMBOLS);
  mids[symbol] = round(mids[symbol] * (1 + (Math.random() - 0.5) * 0.004));
  const mid = mids[symbol];

  const late = Math.random() < 0.05;
  const timestamp = Date.now() - (late ? Math.floor(Math.random() * 2000) : 0);
  const id = `e${nextId++}`;

  if (Math.random() < 0.5) {
    const spread = round(0.01 + Math.random() * 0.05);
    return { id, type: "quote", symbol, bid: round(mid - spread), ask: round(mid + spread), timestamp };
  }

  const side: Side = Math.random() < 0.5 ? "buy" : "sell";
  return {
    id,
    type: "trade",
    side,
    symbol,
    price: round(mid + (side === "buy" ? 0.02 : -0.02)),
    quantity: (1 + Math.floor(Math.random() * 50)) * 10,
    timestamp,
  };
}

/**
 * Calls onEvent for every market event until unsubscribed.
 * Returns an unsubscribe function (safe to call more than once).
 */
function subscribeToEvents(onEvent: (event: MarketEvent) => void): () => void {
  activeSubscriptions++;
  let active = true;
  let timer: ReturnType<typeof setTimeout>;
  let untilBurst = 3000 + Math.random() * 4000;

  const tick = () => {
    if (!active) return;
    const wait = 60 + Math.random() * 140; // ~5–15 events per second
    untilBurst -= wait;

    if (untilBurst <= 0) {
      const burst = 20 + Math.floor(Math.random() * 21);
      for (let i = 0; i < burst && active; i++) onEvent(makeEvent());
      untilBurst = 3000 + Math.random() * 4000;
    } else {
      onEvent(makeEvent());
    }

    timer = setTimeout(tick, wait);
  };

  timer = setTimeout(tick, 100);

  return () => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    activeSubscriptions--;
  };
}

function getActiveSubscriptionCount() {
  return activeSubscriptions;
}

export { subscribeToEvents, getActiveSubscriptionCount };
