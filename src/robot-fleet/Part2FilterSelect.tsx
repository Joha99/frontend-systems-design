/**
 * Robot Fleet Dashboard (Part 2 of 3): Filter, sort, select
 *
 * Start from your Part 1 code.
 *
 * Requirements:
 * 1. Status filter (multi-select chips: idle, moving, charging, error,
 *    offline, stale) and a name search box. Filters combine (AND).
 * 2. Sort by name, battery, or last seen (click a column header; click again
 *    to reverse). Show the sort direction, accessibly (aria-sort).
 * 3. Rows don't jump around while you read them: with 300 updates/s, a
 *    battery sort would reshuffle constantly. Decide how to handle it
 *    (e.g. re-sort at most once a second, or a "paused / N changes" toggle)
 *    and say why.
 * 4. Click a row to open a detail panel for that robot:
 *    - live status, battery, position
 *    - a battery sparkline of the last 60 seconds (inline SVG is fine)
 *    - the panel stays open and keeps updating even if the robot is
 *      filtered out of the table.
 * 5. Filters and the selected robot live in the URL (?status=error&robot=r12)
 *    so a link can be shared with a teammate.
 *
 * Done when: you can find all erroring robots with low battery in two clicks,
 * open one, and watch its battery line move.
 *
 * Discussion:
 * - Battery history: where is it stored, and how big can it get? What do you
 *   keep for robots that aren't selected?
 * - Is the filtered/sorted list stored or derived? What's memoized?
 *
 * Time target: 45 minutes.
 */

export const Part2FilterSelect = () => {
  return (
    <div>
      <h2>Robot Fleet: Part 2</h2>
    </div>
  );
};
