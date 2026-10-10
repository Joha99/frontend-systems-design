/**
 * File Browser with Grouping (Part 1 of 4): Flat Paths → Tree
 *
 * The server stores files as a FLAT list of paths. Build a folder tree from
 * it and browse it like Finder's list view.
 *
 * API: fetchEntries() → FileEntry[]  (rejects ~20% of the time)
 *      { id, path: "src/ui/Button.tsx", type: "file" | "folder", size, modifiedAt }
 *
 * The data (read mockApi.ts):
 * - Folders are mostly IMPLIED by file paths. "src/ui/Button.tsx" means
 *   folders "src" and "src/ui" exist, even though no entry says so.
 * - Empty folders are the only folders sent as explicit entries.
 * - Entries arrive in random order: a child can come before its parent.
 *
 * Requirements:
 * 1. Load entries on mount with loading and error states, plus a Retry button.
 * 2. Build a normalized tree: nodes by id, each folder knowing its
 *    children's ids, and a synthetic root. Every folder appears exactly
 *    once, however many files imply it and whether or not it was sent
 *    explicitly. Implied folders need ids you generate yourself.
 * 3. Folder aggregates, shown on each folder row:
 *    - size: total bytes of every file anywhere inside it
 *    - item count: direct children only ("4 items")
 *    - modified: the latest modifiedAt of anything inside it
 *    Compute all of them in ONE pass over the tree, not one walk per folder.
 * 4. Show ONE folder at a time (start at the root) as a list: icon, name,
 *    size (human readable: "12.4 KB", "1.2 MB"), modified date.
 *    Folders first, then files. Within each, sort by name using natural
 *    order: notes2 comes before notes10.
 * 5. Clicking a folder opens it. A breadcrumb trail ("Root / src /
 *    components") shows where you are, and each crumb is clickable.
 *
 * Done when: the root shows 7 files and 7 folders; "src/util" and
 * "src/utils" are separate folders; "tmp" shows as an empty folder; the
 * meeting notes sort notes1, notes2, notes3, notes10, notes11; and the
 * "src" size equals the sum of every file under it.
 *
 * Think about:
 * - Splitting a path gives you every ancestor. How do you make sure an
 *   ancestor is created only once, even when it's seen many times and in
 *   any order? What should you key folders by while building?
 * - Folder size depends on children's sizes. Which traversal order lets you
 *   compute a parent after all its children?
 * - Should the aggregates be stored in state or derived? What changes in
 *   Part 4 when files start moving?
 *
 * Time target: 40 minutes.
 */

import styles from "./FileGrouping.module.css";
import { fetchEntries } from "./mockApi";

export const Part1BuildTree = () => {
  // TODO: implement
  void [styles, fetchEntries];

  return (
    <div>
      <h2>File Browser with Grouping: Part 1</h2>
    </div>
  );
};
