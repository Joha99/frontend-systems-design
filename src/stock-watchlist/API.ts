/**
 * Simulated stock API (same idea as a take-home's API.ts: a local module
 * standing in for a server).
 *
 * - search(term): synchronous lookup over a fixed list of tickers.
 * - subscribe(symbol, onUpdate): pushes a new price for that symbol every
 *   ~1–2s until you call the returned unsubscribe function.
 * - getActiveSubscriptionCount(): how many subscriptions are still open.
 *   Use it to check you're not leaking subscriptions.
 */

export interface Ticker {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  /** Change since the price when the session started. */
  change: number;
  changePercent: number;
  timestamp: number;
}

const TICKERS: (Ticker & { openPrice: number })[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", openPrice: 228.5 },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", openPrice: 186.2 },
  { symbol: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ", openPrice: 158.9 },
  { symbol: "BA", name: "Boeing Co.", exchange: "NYSE", openPrice: 171.3 },
  { symbol: "BAC", name: "Bank of America", exchange: "NYSE", openPrice: 39.8 },
  { symbol: "COST", name: "Costco Wholesale", exchange: "NASDAQ", openPrice: 902.4 },
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE", openPrice: 287.6 },
  { symbol: "DIS", name: "Walt Disney Co.", exchange: "NYSE", openPrice: 94.1 },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", exchange: "NASDAQ", openPrice: 167.3 },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", exchange: "NASDAQ", openPrice: 165.9 },
  { symbol: "GS", name: "Goldman Sachs Group", exchange: "NYSE", openPrice: 512.7 },
  { symbol: "INTC", name: "Intel Corp.", exchange: "NASDAQ", openPrice: 22.4 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", openPrice: 221.0 },
  { symbol: "KO", name: "Coca-Cola Co.", exchange: "NYSE", openPrice: 70.2 },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", openPrice: 589.1 },
  { symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", openPrice: 430.6 },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE", openPrice: 118.4 },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", openPrice: 711.0 },
  { symbol: "NKE", name: "Nike Inc.", exchange: "NYSE", openPrice: 84.3 },
  { symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", openPrice: 121.4 },
  { symbol: "ORCL", name: "Oracle Corp.", exchange: "NYSE", openPrice: 171.8 },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ", openPrice: 168.9 },
  { symbol: "PYPL", name: "PayPal Holdings", exchange: "NASDAQ", openPrice: 79.5 },
  { symbol: "SHOP", name: "Shopify Inc.", exchange: "NYSE", openPrice: 79.1 },
  { symbol: "T", name: "AT&T Inc.", exchange: "NYSE", openPrice: 21.9 },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", openPrice: 250.1 },
  { symbol: "UBER", name: "Uber Technologies", exchange: "NYSE", openPrice: 74.6 },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", openPrice: 287.3 },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", openPrice: 80.9 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", exchange: "NYSE", openPrice: 118.2 },
];

/**
 * Case-insensitive search by symbol or company name.
 * Symbol-prefix matches come first, then other symbol matches, then name
 * matches. Returns at most 10 results. An empty term returns [].
 */
function search(term: string): Ticker[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];

  const rank = (t: Ticker) => {
    const symbol = t.symbol.toLowerCase();
    if (symbol.startsWith(q)) return 0;
    if (symbol.includes(q)) return 1;
    if (t.name.toLowerCase().includes(q)) return 2;
    return -1;
  };

  return TICKERS.map((t) => ({ t, r: rank(t) }))
    .filter(({ r }) => r !== -1)
    .sort((a, b) => a.r - b.r || a.t.symbol.localeCompare(b.t.symbol))
    .slice(0, 10)
    .map(({ t }) => ({ symbol: t.symbol, name: t.name, exchange: t.exchange }));
}

// Shared current prices, so two subscribers to the same symbol see the
// same price.
const currentPrices = new Map<string, number>(TICKERS.map((t) => [t.symbol, t.openPrice]));
let activeSubscriptions = 0;

const round = (n: number) => Math.round(n * 100) / 100;

function nextPrice(symbol: string) {
  const price = currentPrices.get(symbol)!;
  // Random walk: move up to ±1% each tick.
  const next = Math.max(0.01, round(price * (1 + (Math.random() - 0.5) * 0.02)));
  currentPrices.set(symbol, next);
  return next;
}

function toUpdate(symbol: string, price: number): PriceUpdate {
  const open = TICKERS.find((t) => t.symbol === symbol)!.openPrice;
  return {
    symbol,
    price,
    change: round(price - open),
    changePercent: round(((price - open) / open) * 100),
    timestamp: Date.now(),
  };
}

/**
 * Calls onUpdate with the current price shortly after subscribing, then
 * with a new price every 1–2 seconds. Returns an unsubscribe function.
 * Throws if the symbol doesn't exist.
 */
function subscribe(symbol: string, onUpdate: (update: PriceUpdate) => void): () => void {
  if (!currentPrices.has(symbol)) {
    throw new Error(`Unknown symbol "${symbol}"`);
  }

  activeSubscriptions++;
  let active = true;
  let timer: ReturnType<typeof setTimeout>;

  const tick = () => {
    if (!active) return;
    onUpdate(toUpdate(symbol, nextPrice(symbol)));
    timer = setTimeout(tick, 1000 + Math.random() * 1000);
  };

  // First update arrives asynchronously, like a real socket would.
  timer = setTimeout(() => {
    if (!active) return;
    onUpdate(toUpdate(symbol, currentPrices.get(symbol)!));
    timer = setTimeout(tick, 1000 + Math.random() * 1000);
  }, 200);

  return () => {
    if (!active) return; // calling unsubscribe twice is harmless
    active = false;
    clearTimeout(timer);
    activeSubscriptions--;
  };
}

function getActiveSubscriptionCount() {
  return activeSubscriptions;
}

export { search, subscribe, getActiveSubscriptionCount };
