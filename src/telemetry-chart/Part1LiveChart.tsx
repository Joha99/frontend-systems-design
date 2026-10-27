/**
 * Live Telemetry Chart (Part 1 of 2): Streaming line chart
 *
 * An engineer watches one robot's sensors in real time. The fake feed is in
 * `telemetryStream.ts` (read its header; don't edit it). No chart libraries:
 * draw it yourself (canvas or SVG; say which and why).
 *
 * Requirements:
 * 1. A signal picker (from `listSignals`). Switching signals unsubscribes from
 *    the old one and starts fresh.
 * 2. A line chart of the last 30 seconds that scrolls smoothly as time
 *    passes (the right edge is "now").
 *    - x-axis: time labels every 5 s; y-axis: the signal's min/max with its
 *      unit; a gridline or two.
 *    - Out-of-order and duplicate samples must not draw zig-zags back in
 *      time: keep samples sorted by t and deduped.
 * 3. Current value in large text above the chart, with the unit.
 * 4. Window selector: 10 s / 30 s / 2 min. At 2 min that's 6,000 points on a
 *    chart ~800 px wide: don't draw more points than pixels (downsample, e.g.
 *    min/max per pixel column so spikes don't disappear).
 * 5. Pause button: the chart freezes so you can look at it, but data keeps
 *    arriving in the background. Resume jumps back to live.
 *
 * Performance: draw at most once per animation frame, not once per batch.
 * Memory: the page may stay open for hours. Don't keep samples forever.
 *
 * Done when: the line scrolls smoothly at 60 fps, spikes stay visible at the
 * 2-min window, and memory stays flat after 5 minutes (check DevTools).
 *
 * Discussion:
 * - Canvas or SVG here, and when would you switch?
 * - Where do samples live? (React state, a ref, a ring buffer?) What actually
 *   needs to trigger a React render?
 * - Whose clock is "now": Date.now() or the latest sample's t? What if the
 *   browser clock is 2 s off from the server?
 *
 * Time target: 60 minutes. Plan out loud for 5 minutes first.
 */

import { listSignals, subscribe } from "./telemetryStream";

// Remove these once you use them.
void listSignals;
void subscribe;

export const Part1LiveChart = () => {
  return (
    <div>
      <h2>Telemetry Chart: Part 1</h2>
    </div>
  );
};
