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
 *
 * 4. Show ONE folder at a time (start at the root) as a list: icon, name,
 *    size (human readable: "12.4 KB", "1.2 MB"), modified date.
 *    Folders first, then files. Within each, sort by name using natural
 *    order: notes2 comes before notes10.
 *
 * 5. Clicking a folder opens it. A breadcrumb trail ("Root / src /
 *    components") shows where you are, and each crumb is clickable.
 */

import { useEffect, useState } from "react";
import styles from "./FileGrouping.module.css";
import { fetchEntries, type FileEntry } from "./mockApi";

let nextId = 66;

interface TreeNode extends FileEntry {
  children: Set<FileEntry["id"]>;
}
type EntryMap = Record<TreeNode["id"], TreeNode>;

const Entry = ({ node, entries }: { node: TreeNode; entries: EntryMap }) => {
  const [open, setOpen] = useState<boolean>(false);

  const onClick = () => {
    setOpen((prev) => !prev);
  };

  if (node.children.size === 0) {
    return <li>{node.type === "folder" ? <h3>{node.path}</h3> : node.path}</li>;
  }

  return (
    <li>
      <h3>
        {node.path} <button onClick={onClick}>{open ? "▲" : "▼"}</button>
      </h3>
      {open && (
        <ul>
          {[...node.children].map((id) => {
            return <Entry key={id} node={entries[id]} entries={entries} />;
          })}
        </ul>
      )}
    </li>
  );
};

export const Part1BuildTree = () => {
  const [entries, setEntries] = useState<EntryMap>({});
  const [rootId, setRootId] = useState<TreeNode["id"]>();

  const buildNormalizedTree = (entries: FileEntry[]) => {
    const entryMap: EntryMap = {};
    const seenFolders: Record<TreeNode["path"], TreeNode["id"]> = {};
    const rootChildren: Set<TreeNode["id"]> = new Set();

    entries.forEach((entry) => {
      const path = entry.path;
      let folders = path.includes("/") ? path.split("/") : [path];

      // add files to the entry map
      if (entry.type === "file") {
        const fileName = folders[folders.length - 1];
        const fileNode: TreeNode = {
          ...entry,
          path: fileName,
          children: new Set(),
        };
        entryMap[entry.id] = fileNode;
        folders = folders.slice(0, -1);
      }

      // add folders to the entry map
      for (let f = 0; f < folders.length; f++) {
        const folderName = `${folders[f]}/`;

        if (seenFolders[folderName] !== undefined) continue;

        // we have to add a folder to the children of parent folders if f is > 0
        const folderId = `e${nextId++}`;
        const folderNode: TreeNode = {
          id: folderId,
          path: folderName,
          type: "folder",
          size: 0,
          modifiedAt: entry.modifiedAt,
          children: new Set(),
        };
        entryMap[folderId] = folderNode;
        seenFolders[folderName] = folderId;

        if (f === 0) {
          rootChildren.add(folderId);
        } else {
          // we are guaranteed to have already added the parent folder to the entry map
          const parentFolderName = `${folders[f - 1]}/`;
          const parentFolderId = seenFolders[parentFolderName];
          entryMap[parentFolderId].children.add(folderId);
          entryMap[parentFolderId].size++;
        }
      }

      if (entry.type === "file") {
        if (folders.length === 0) {
          rootChildren.add(entry.id);
        } else {
          const parentFolderName = `${folders[folders.length - 1]}/`;
          const parentFolderId = seenFolders[parentFolderName];
          entryMap[parentFolderId].children.add(entry.id);
          entryMap[parentFolderId].size++;
        }
      }
    });

    // create a root node
    const rootId = `e${nextId++}`;
    const rootNode: TreeNode = {
      id: rootId,
      path: "/",
      type: "folder",
      size: rootChildren.size,
      modifiedAt: new Date(Date.now()).toISOString(),
      children: rootChildren,
    };
    entryMap[rootId] = rootNode;
    setEntries(entryMap);
    setRootId(rootId);
  };

  useEffect(() => {
    fetchEntries().then((res) => {
      buildNormalizedTree(res);
    });
  }, []);

  if (!rootId) {
    return null;
  }

  const rootLevelChildren = [...entries[rootId].children];

  return (
    <div>
      <h2>File Browser with Grouping: Part 1</h2>
      <ol>
        {rootLevelChildren.map((childId) => {
          return (
            <Entry key={childId} node={entries[childId]} entries={entries} />
          );
        })}
      </ol>
    </div>
  );
};
