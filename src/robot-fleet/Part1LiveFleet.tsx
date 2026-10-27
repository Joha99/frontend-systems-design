/**
 * Robot Fleet Dashboard (Part 1 of 3): Live fleet list
 *
 * A warehouse runs ~1,000 robots. Ops staff keep this page open all shift to
 * watch them. The fake server is in `fleetServer.ts` (read its header; don't
 * edit it).
 *
 * Requirements:
 * 1. On mount, load the snapshot (`fetchSnapshot`), then `connect` with the
 *    snapshot's seq so you don't miss events between the two.
 * 2. Keep robots in a normalized store (by id). Apply robot_updated /
 *    robot_added / robot_removed events.
 * 3. A table, one row per robot: name, status, battery %, position, and
 *    "last seen" ("3s ago").
 *    - Status shown as a coloured badge (error stands out).
 *    - Battery < 20% is highlighted.
 * 4. Summary bar on top: count per status (idle 210 · moving 480 · …).
 * 5. "Stale": a robot with no update for 10 s gets a stale badge and a dimmed
 *    row, even if no new event arrives for it (time passing alone must
 *    update the UI).
 * 6. Loading state for the first load; no layout jump when data arrives.
 *
 * Performance: the server sends ~300 events per second. Your page must stay
 * smooth (scrolling, typing). Don't re-render the whole table on every event.
 *
 * Done when: the counts and rows update live, stale robots show up after
 * ~10 s of silence, and the page stays smooth for a minute.
 *
 * Discussion:
 * - Where do 300 events/s go before they reach React? What's the batching
 *   window, and why that one?
 * - How does "last seen 3s ago" update without an event for that robot?
 *   What re-renders every second, and how do you keep that cheap?
 * - Whose clock decides "stale": the browser's or the server's?
 *
 * Time target: 60 minutes. Plan out loud for 5 minutes first.
 */

// Types you'll want: Robot, FleetEvent, RobotStatus, ServerMessage (import type).
import { fetchSnapshot, connect } from "./fleetServer";

// Remove these once you use them.
void fetchSnapshot;
void connect;

export const Part1LiveFleet = () => {
  return (
    <div>
      <h2>Robot Fleet: Part 1</h2>
    </div>
  );
};
