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
 */

import { useEffect, useState } from "react";
import { fetchEntries, type FileEntry } from "./mockApi";

interface TreeNode extends FileEntry {
  /** Last path segment, for display and sorting. `path` stays the full path. */
  name: string;
  children: Set<TreeNode["id"]>;
}
type EntryMap = Record<TreeNode["id"], TreeNode>;

// Folder ids come from the full path, so a folder gets the same id no matter
// which entry implies it, and "assets/archive" and "archive" never collide.
const folderId = (path: string) => `folder:${path}`;
const ROOT_ID = folderId("");

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

const Entry = ({
  node,
  onOpen,
}: {
  node: TreeNode;
  onOpen: (id: TreeNode["id"]) => void;
}) => {
  const size = `${node.size / 1000} KB`;

  if (node.type === "file") {
    return (
      <li>
        {node.name} ({size})
      </li>
    );
  }

  return (
    <li>
      <button onClick={() => onOpen(node.id)}>{node.name}/</button> ({size})
    </li>
  );
};

export const Part1BuildTree = () => {
  const [entries, setEntries] = useState<EntryMap>();
  // folder ids from the root down to the folder being shown (the last one)
  const [folderPath, setFolderPath] = useState<TreeNode["id"][]>([ROOT_ID]);

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

  const openFolder = (id: TreeNode["id"]) => {
    setFolderPath((prev) => [...prev, id]);
  };

  return (
    <div>
      <h2>File Browser with Grouping: Part 1</h2>
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
      <ol>
        {sortedChildren.map((id) => (
          <Entry key={id} node={entries[id]} onOpen={openFolder} />
        ))}
      </ol>
      {sortedChildren.length === 0 && <p>This folder is empty.</p>}
    </div>
  );
};
