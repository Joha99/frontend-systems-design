/**
 * Fake telemetry feed for the live chart problem. Don't edit this file: treat
 * it as the server.
 *
 *   listSignals()                → the signals you can chart
 *   subscribe(signalId, onBatch) → batches of samples, ~every 100 ms
 *   fetchHistory(signalId, from, to) → older samples (like GET /api/history)
 *
 * What it does on purpose:
 * - Each signal produces 50 samples per second (a sample every 20 ms),
 *   delivered in batches.
 * - Batches occasionally arrive late and OUT OF ORDER (network jitter).
 * - Values are noisy, with an occasional spike (a fault worth seeing).
 * - Samples can repeat (same t) after a resend; dedupe by t.
 */

export type Sample = { t: number; value: number }; // t = epoch ms, server time

export type Signal = {
  id: string;
  label: string;
  unit: string;
  min: number; // normal operating range (for the y-axis)
  max: number;
};

export type Subscription = { unsubscribe: () => void };

const SIGNALS: Signal[] = [
  { id: "motor_temp", label: "Motor temperature", unit: "°C", min: 20, max: 90 },
  { id: "battery_v", label: "Battery voltage", unit: "V", min: 44, max: 54 },
  { id: "speed", label: "Speed", unit: "m/s", min: 0, max: 3 },
];

const SAMPLE_MS = 20;
const BATCH_MS = 100;

const base = (signal: Signal, t: number) => {
  const mid = (signal.min + signal.max) / 2;
  const amp = (signal.max - signal.min) / 4;
  return mid + amp * Math.sin(t / 4000 + signal.id.length);
};

const valueAt = (signal: Signal, t: number) => {
  const noise = (Math.random() - 0.5) * (signal.max - signal.min) * 0.05;
  const spike =
    Math.random() < 0.002 ? (signal.max - signal.min) * 0.6 : 0;
  return Math.round((base(signal, t) + noise + spike) * 100) / 100;
};

const find = (signalId: string) => {
  const signal = SIGNALS.find((s) => s.id === signalId);
  if (!signal) throw new Error(`Unknown signal: ${signalId}`);
  return signal;
};

export const listSignals = (): Promise<Signal[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...SIGNALS]), 200));

/** Live samples from now on, in batches. Batches can arrive out of order. */
export const subscribe = (
  signalId: string,
  onBatch: (samples: Sample[]) => void,
): Subscription => {
  const signal = find(signalId);
  let last = Math.floor(Date.now() / SAMPLE_MS) * SAMPLE_MS;
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const interval = setInterval(() => {
    const now = Date.now();
    const batch: Sample[] = [];
    while (last + SAMPLE_MS <= now) {
      last += SAMPLE_MS;
      batch.push({ t: last, value: valueAt(signal, last) });
    }
    if (batch.length === 0) return;

    // 5% of batches are delayed by up to 600 ms → out of order
    const delay = Math.random() < 0.05 ? 200 + Math.random() * 400 : 0;
    // 2% of batches are resent once (duplicates)
    const resend = Math.random() < 0.02;

    const send = (samples: Sample[], ms: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (active) onBatch(samples.map((s) => ({ ...s })));
      }, ms);
      timers.add(timer);
    };
    send(batch, delay);
    if (resend) send(batch, delay + 150);
  }, BATCH_MS);

  return {
    unsubscribe: () => {
      active = false;
      clearInterval(interval);
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    },
  };
};

/** Older samples in [from, to), sorted by t. Slow, like a real history API. */
export const fetchHistory = (
  signalId: string,
  from: number,
  to: number,
): Promise<Sample[]> => {
  const signal = find(signalId);
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const samples: Sample[] = [];
        const start = Math.ceil(from / SAMPLE_MS) * SAMPLE_MS;
        for (let t = start; t < to && t <= Date.now(); t += SAMPLE_MS) {
          samples.push({ t, value: valueAt(signal, t) });
        }
        resolve(samples);
      },
      400 + Math.random() * 600,
    );
  });
};
