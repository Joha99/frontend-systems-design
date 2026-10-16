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

// Starting point: your Part 1 code.
import { useEffect, useState } from "react";
import { fetchEntries, type FileEntry } from "./mockApi";

interface TreeNode extends FileEntry {
  /** Last path segment, for display and sorting. `path` stays the full path. */
  name: string;
  children: Set<TreeNode["id"]>;
}
type EntryMap = Record<TreeNode["id"], TreeNode>;
type GroupBy = "none" | "kind" | "date-modified" | "size";
type Kind = "FOLDER" | "CODE" | "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO";

// Folder ids come from the full path, so a folder gets the same id no matter
// which entry implies it, and "assets/archive" and "archive" never collide.
const folderId = (path: string) => `folder:${path}`;
const ROOT_ID = folderId("");
const KIND = ["FOLDER", "CODE", "DOCUMENT", "IMAGE", "VIDEO", "AUDIO"];

const getSortedChildren = (id: TreeNode["id"], entries: EntryMap) => {
  const byName = (a: TreeNode["id"], b: TreeNode["id"]) =>
    entries[a].name.localeCompare(entries[b].name, undefined, {
      numeric: true,
    });

  const childrenIds = [...entries[id].children];
  const folders = childrenIds
    .filter((id) => entries[id].type === "folder")
    .sort(byName);
  const files = childrenIds
    .filter((id) => entries[id].type === "file")
    .sort(byName);

  return [...folders, ...files];
};

const buildNormalizedTree = (flatEntries: FileEntry[]): EntryMap => {
  const entryMap: EntryMap = {
    [ROOT_ID]: {
      id: ROOT_ID,
      path: "",
      name: "Root",
      type: "folder",
      size: 0,
      modifiedAt: new Date(0).toISOString(),
      children: new Set(),
    },
  };

  flatEntries.forEach((entry) => {
    const segments = entry.path.split("/");
    // every folder this entry is inside, from the root down:
    // "src/components/Button.tsx" -> ["", "src", "src/components"]
    const ancestorPaths = segments.map((_, i) =>
      segments.slice(0, i).join("/"),
    );

    // create any missing folders, parents before children. An explicit
    // (empty) folder entry also creates itself.
    const folderPaths =
      entry.type === "folder" ? [...ancestorPaths, entry.path] : ancestorPaths;

    folderPaths.forEach((path, i) => {
      const id = folderId(path);
      if (entryMap[id]) return;

      entryMap[id] = {
        id,
        path,
        name: segments[i - 1],
        type: "folder",
        size: 0,
        // the creating entry is always inside this folder (or is it), so its
        // date is a valid starting point for "latest modified"
        modifiedAt: entry.modifiedAt,
        children: new Set(),
      };
      // i > 0 here: the root always exists, so its parent was handled already
      entryMap[folderId(folderPaths[i - 1])].children.add(id);
    });

    if (entry.type === "file") {
      entryMap[entry.id] = {
        ...entry,
        name: segments[segments.length - 1],
        children: new Set(),
      };
      entryMap[folderId(ancestorPaths[ancestorPaths.length - 1])].children.add(
        entry.id,
      );
    }

    // roll size and latest modified up into every ancestor, root included
    ancestorPaths.forEach((path) => {
      const folder = entryMap[folderId(path)];
      folder.size += entry.size;

      const folderTimestamp = new Date(folder.modifiedAt).getTime();
      const entryTimestamp = new Date(entry.modifiedAt).getTime();
      if (entryTimestamp > folderTimestamp) {
        folder.modifiedAt = entry.modifiedAt;
      }
    });
  });

  return entryMap;
};

const dayDiff = (a: Date, b: Date) => {
  const toDays = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000;
  return toDays(b) - toDays(a); // signed: positive if b is after a
};

const groupByKind = (entries: EntryMap, sortedChildren: TreeNode["id"][]) => {
  const groups: Record<string, TreeNode["id"][]> = {
    folder: [],
    code: [],
    document: [],
    image: [],
    video: [],
    audio: [],
    font: [],
    archive: [],
    other: [],
  };

  for (const id of sortedChildren) {
    if (entries[id].type === "folder") {
      groups["folder"].push(id);
      continue;
    }

    const fileNameSplit = entries[id].name.split(".");
    const extension = fileNameSplit[fileNameSplit.length - 1];

    switch (extension) {
      case "ts":
      case "tsx":
      case "js":
      case "py":
      case "sh": {
        groups["code"].push(id);
        break;
      }
      case "md":
      case "tsx":
      case "pdf":
      case "xlsx":
      case "csv":
      case "json": {
        groups["document"].push(id);
        break;
      }
      case "png":
      case "jpg":
      case "svg":
      case "ico": {
        groups["image"].push(id);
        break;
      }
      case "mp4":
      case "mov": {
        groups["video"].push(id);
        break;
      }
      case "mp3": {
        groups["audio"].push(id);
        break;
      }
      case "woff2": {
        groups["font"].push(id);
        break;
      }
      case "zip":
      case "gz": {
        groups["archive"].push(id);
        break;
      }
      default: {
        groups["other"].push(id);
        break;
      }
    }
  }
  console.log(groups);
  return groups;
};

const groupByDateModified = (
  entries: EntryMap,
  sortedChildren: TreeNode["id"][],
) => {
  const groups: Record<string, TreeNode["id"][]> = {
    today: [],
    yesterday: [],
    "previous-30-days": [],
    "previous-year": [],
  };

  const today = new Date(Date.now());

  for (const id of sortedChildren) {
    const modifiedDate = new Date(entries[id].modifiedAt);
    const month = modifiedDate.toLocaleString("en-US", { month: "long" });
    const year = modifiedDate.getFullYear();
    const daysApart = dayDiff(today, modifiedDate);

    if (year < today.getFullYear()) {
      groups["previous-year"].push(id);
    } else if (daysApart === 0) {
      groups["today"].push(id);
    } else if (daysApart === -1) {
      groups["yesterday"].push(id);
    } else if (daysApart >= -30 && daysApart < 0) {
      groups["previous-30-days"].push(id);
    } else {
      if (!groups[month]) {
        groups[month] = [id];
      } else {
        groups[month].push(id);
      }
    }
  }
  console.log(groups);
  return groups;
};

const groupBySize = (entries: EntryMap, sortedChildren: TreeNode["id"][]) => {
  //   Size: Empty (0 B) · Tiny (< 10 KB) · Small (< 1 MB) · Medium (< 100 MB) ·
  //   Huge (≥ 100 MB). Folders use their aggregate size.
  const groups: Record<string, TreeNode["id"][]> = {
    "0-b": [],
    "10-kb": [],
    small: [],
    medium: [],
    huge: [],
  };
};

const Entry = ({
  node,
  onOpen,
}: {
  node: TreeNode;
  onOpen: (id: TreeNode["id"]) => void;
}) => {
  const size = `${node.size / 1000} KB`;
  const modified = new Date(node.modifiedAt).toLocaleDateString();

  if (node.type === "file") {
    return (
      <li>
        {node.name} ({size}) ({modified})
      </li>
    );
  }

  return (
    <li>
      <button onClick={() => onOpen(node.id)}>{node.name}/</button> ({size}) (
      {modified})
    </li>
  );
};

export const Part2GroupBy = () => {
  const [entries, setEntries] = useState<EntryMap>();
  // folder ids from the root down to the folder being shown (the last one)
  const [folderPath, setFolderPath] = useState<TreeNode["id"][]>([ROOT_ID]);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  useEffect(() => {
    fetchEntries().then((res) => {
      setEntries(buildNormalizedTree(res));
    });
  }, []);

  if (!entries) {
    return null;
  }

  const currentFolderId = folderPath[folderPath.length - 1];
  const sortedChildren = getSortedChildren(currentFolderId, entries);
  // TODO: compute grouped children from the group by state

  const openFolder = (id: TreeNode["id"]) => {
    setFolderPath((prev) => [...prev, id]);
  };

  const onGroupBy = (newGroup: GroupBy) => {
    setGroupBy(newGroup);
  };

  return (
    <div>
      <h2>File Browser with Grouping: Part 2</h2>
      <nav aria-label="Breadcrumbs">
        {folderPath.map((id, index) => (
          <button
            key={id}
            style={{ padding: 0, color: "blue", marginRight: "5px" }}
            onClick={() => setFolderPath((prev) => prev.slice(0, index + 1))}
          >
            {entries[id].name} /
          </button>
        ))}
      </nav>
      <div>
        <label htmlFor="group-by">Group by</label>
        <select
          name="group-by"
          value={groupBy}
          onChange={(e) => {
            console.log(e.target.value);
            const newGroup = e.target.value;
            onGroupBy(newGroup as GroupBy);
          }}
        >
          <option value="none">None</option>
          <option value="kind">Kind</option>
          <option value="date-modified">Date modified</option>
          <option value="size">Size</option>
        </select>
      </div>
      <ol>
        {sortedChildren.map((id) => (
          <Entry key={id} node={entries[id]} onOpen={openFolder} />
        ))}
      </ol>
      {sortedChildren.length === 0 && <p>This folder is empty.</p>}
    </div>
  );
};
