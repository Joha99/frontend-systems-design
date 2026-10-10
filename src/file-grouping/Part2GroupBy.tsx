/**
 * File Browser with Grouping (Part 2 of 4): Group By
 *
 * Start from your Part 1 code. Add Finder-style "Group by" to the
 * current folder's list.
 *
 * Requirements:
 * 1. A "Group by" select: None | Kind | Date Modified | Size.
 *    None is the Part 1 list. Otherwise the current folder's children are
 *    split into groups, each with a header: "Images · 4".
 *
 * 2. Kind (from the file extension, case-insensitive):
 *    Folder · Code (ts, tsx, js, py, sh) · Document (md, txt, pdf, xlsx, csv,
 *    json) · Image (png, jpg, svg, ico) · Video (mp4, mov) · Audio (mp3) ·
 *    Font (woff2) · Archive (zip, gz) · Other.
 *    Edge cases: ".gitignore" and ".env.example" are dotfiles, and "Makefile"
 *    and "LICENSE" have no extension. Decide what each one is, and say why.
 *    "backup-2025.tar.gz" is an Archive.
 *
 * 3. Date Modified, by CALENDAR day in local time (not 24h blocks):
 *    Today · Yesterday · Previous 7 Days · Previous 30 Days · then one group
 *    per month this year ("August") · then one group per older year ("2024").
 *    Folders use their aggregate "modified" from Part 1.
 *
 * 4. Size: Empty (0 B) · Tiny (< 10 KB) · Small (< 1 MB) · Medium (< 100 MB) ·
 *    Huge (≥ 100 MB). Folders use their aggregate size.
 *
 * 5. Group order is MEANINGFUL, not alphabetical: Kind in the order listed,
 *    dates newest first, sizes smallest first. Empty groups are hidden.
 *    Inside a group, sort by name (natural order, folders first).
 *
 * 6. Clicking a group header collapses / expands it. Collapsed groups are
 *    remembered per grouping mode: collapse "Images" under Kind, switch to
 *    Size and back, and "Images" is still collapsed. Opening another folder
 *    keeps the same collapsed groups.
 *
 * 7. Grouping must not run on every render: changing an unrelated piece of
 *    state (e.g. hovering a row, if that's state) must not regroup.
 *
 * Done when: in "src/components" grouped by Kind you see Folder · 2,
 * Code · 4, Other · 2 (CSS isn't in the list, so it falls to Other); in
 * the root grouped by Date, nothing modified yesterday lands in "Today";
 * and collapse state survives switching modes.
 *
 * Think about:
 * - Each mode is "item → group key" plus "how groups are ordered". Can
 *   one generic grouping function take those two things as input, so
 *   adding a fifth mode is a few lines?
 * - Date buckets depend on "now". What happens if the tab stays open past
 *   midnight? (You don't have to fix it, but be able to explain it.)
 * - What does useMemo need to depend on, and what would make it recompute
 *   on every render by accident?
 *
 * Time target: 40 minutes.
 */

import styles from "./FileGrouping.module.css";
import { fetchEntries } from "./mockApi";

export const Part2GroupBy = () => {
  // TODO: implement
  void [styles, fetchEntries];

  return (
    <div>
      <h2>File Browser with Grouping: Part 2</h2>
    </div>
  );
};
