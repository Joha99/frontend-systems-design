/**
 * Live Telemetry Chart (Part 2 of 2): History, hover, alerts
 *
 * Start from your Part 1 code.
 *
 * Requirements:
 * 1. Hover: a vertical crosshair follows the mouse, with a tooltip showing the
 *    time and the nearest sample's value. It works while live (the line moves
 *    under the cursor) and while paused.
 * 2. Scroll back in time: while paused, dragging the chart left pans into the
 *    past. When you pan past what you have, load older samples with
 *    `fetchHistory` (slow). Show a loading region at the left edge; don't
 *    fetch the same range twice; ignore a response for a signal you've
 *    since switched away from.
 * 3. Threshold alert: a user-set threshold line (number input). When the live
 *    value crosses it, show a banner "Motor temperature above 80 °C" with the
 *    time it started. Don't flicker on and off with noise: require it to stay
 *    above for 1 s, and below for 1 s to clear.
 * 4. Accessibility: the current value and alert banner are announced to
 *    screen readers politely (aria-live), but not 50 times a second.
 *
 * Done when: you can pause, pan back 2 minutes, hover a spike to read its
 * value, resume live, and see the alert appear and clear without flicker.
 *
 * Discussion:
 * - How do you find the nearest sample to the cursor quickly? (Sorted array →
 *   binary search.)
 * - Live samples and history samples arrive separately: how do you merge
 *   them without gaps or duplicates?
 *
 * Time target: 45 minutes.
 */

export const Part2HistoryHover = () => {
  return (
    <div>
      <h2>Telemetry Chart: Part 2</h2>
    </div>
  );
};
