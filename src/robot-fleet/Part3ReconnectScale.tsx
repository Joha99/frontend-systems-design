/**
 * Robot Fleet Dashboard (Part 3 of 3): Reconnect + 5,000 robots
 *
 * Start from your Part 2 code.
 *
 * Requirements:
 * 1. The connection drops every ~40 s (see fleetServer.ts). Reconnect
 *    automatically:
 *    - with backoff + jitter (1 s, 2 s, 4 s… capped at 30 s, randomized)
 *    - with `afterSeq` = the last seq you applied, so you only get what you
 *      missed
 *    - not when the component unmounts (closing on purpose ≠ a drop).
 * 2. Gaps: if an event's seq isn't lastSeq + 1, something was lost. Don't
 *    apply it; re-sync instead (snapshot + reconnect).
 * 3. `too_far_behind` → refetch the snapshot and reconnect from its seq.
 * 4. While disconnected: keep showing the last data, show a banner
 *    ("Reconnecting… data may be out of date"), dim the table. Don't mark
 *    every robot stale just because *you* are offline.
 * 5. Scale: change FLEET_SIZE in fleetServer.ts to 5000 (the one edit you may
 *    make). Virtualize the table so only visible rows render; keep keyboard
 *    navigation (↑/↓ moves the selected row, the list scrolls to it).
 *
 * Done when: you can leave it open for 3 minutes through several drops with
 * no missing robots, no double-applied events, and smooth scrolling at 5,000.
 *
 * Discussion:
 * - How do you test the gap logic without waiting for a rare lost event?
 * - What would change with 50,000 robots? (Server-side filtering? Only
 *   subscribing to what's on screen? Canvas instead of DOM for a map view?)
 *
 * Time target: 60 minutes.
 */

export const Part3ReconnectScale = () => {
  return (
    <div>
      <h2>Robot Fleet: Part 3</h2>
    </div>
  );
};
