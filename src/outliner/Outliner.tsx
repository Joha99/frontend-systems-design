/**
 * Keyboard-Driven Outliner (Workflowy / Roam style)
 *
 * Build a nested bullet-list editor where every structural edit can be
 * done from the keyboard, with undo/redo and autosave.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchOutline()                        → { nodes (NESTED), version }
 *   saveChanges(changes, baseVersion)     → { savedAt, version }
 *     changes: { [id]: NodePatch | null }   (null = deleted)
 *     Rejects ~15% of the time, and with "CONFLICT" if baseVersion is stale.
 *
 * Requirements:
 * 1. Load the outline on mount (show a loading state). Render it as a
 *    nested bulleted list. Each bullet is an editable single-line input.
 *    Bullets with children show a collapse arrow.
 * 2. Store the tree NORMALIZED (a lookup of nodes by id, each node knowing
 *    its parent and its ordered children) instead of the nested API shape.
 *    Every operation below should touch only the nodes involved, not
 *    rebuild the tree.
 * 3. Derive a "visible order" list (depth-first, skipping children of
 *    collapsed nodes). Up/Down navigation walks this list.
 * 4. Keyboard (while focused in a bullet's input):
 *    - ArrowUp / ArrowDown: focus previous / next visible bullet.
 *
 *    - Enter: create an empty sibling directly after the current bullet
 *      and focus it. (If the current bullet is expanded and has children,
 *      create it as the FIRST child instead.)
 *
 *    - Tab: indent: make the bullet the last child of its previous
 *      sibling. No-op if there is no previous sibling. Children move with it.
 *
 *    - Shift+Tab: outdent: make the bullet the next sibling of its parent.
 *      No-op at the top level.
 *
 *    - Backspace on an EMPTY bullet with no children: delete it and focus
 *      the previous visible bullet (caret at end of its text).
 *
 *    - Cmd/Ctrl+ArrowUp: collapse. Cmd/Ctrl+ArrowDown: expand.
 *
 *    - Alt+Shift+ArrowUp / ArrowDown: move the bullet (with its subtree)
 *      above / below its sibling. Stays within the same parent.
 *
 *    - Cmd/Ctrl+Z: undo. Cmd/Ctrl+Shift+Z: redo.
 *
 * 5. Focus must survive every operation: after indent/outdent/move the
 *    same bullet keeps focus AND the caret stays at the same offset.
 * 6. Undo/redo covers structural operations (create, delete, indent,
 *    outdent, move, collapse). Text edits do not need to be undoable.
 * 7. Autosave: track which node ids changed ("dirty set"). 1s after the last
 *    edit, send ONE saveChanges batch. Show "Saving…", "Saved", or
 *    "Couldn't save · Retry". Edits made while a save is in flight must not
 *    be lost (they go into the next batch), and only one save may be in
 *    flight at a time. A failed batch is merged back into the dirty set.
 *
 * Stretch:
 * - Enter in the middle of text splits the bullet at the caret.
 * - Clicking a bullet dot "zooms" into it: it becomes the root, with a
 *   breadcrumb trail back to the top.
 * - Handle a CONFLICT by refetching and telling the user.
 *
 * Data structure focus:
 * - Normalized tree: O(1) lookup by id, parent pointers for outdent.
 * - Flattening a tree into visible order (DFS with pruning).
 * - Undo/redo: two stacks. Decide between storing full snapshots and
 *   storing inverse operations, and be ready to defend the choice.
 * - A dirty set for batched saves.
 *
 * Discussion questions:
 * - What's the complexity of indent/outdent in your model vs. the nested one?
 * - How would you render a 50,000-bullet outline smoothly?
 * - How would you support two people editing the same outline live?
 *
 * Time target: 90 minutes.
 */

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import styles from "./Outliner.module.css";
import { fetchOutline, type OutlineNode, saveChanges } from "./mockApi";

interface TreeNode {
  id: OutlineNode["id"];
  text: OutlineNode["text"];
  collapsed: OutlineNode["collapsed"];
  children: OutlineNode["id"][];
  parent?: OutlineNode["id"];
}

type TreeNodeMap = Record<OutlineNode["id"], TreeNode>;

type FetchStatus = "loading" | "success" | "error";

const OutlineItem = ({
  outline,
  map,
  refs,
}: {
  outline: TreeNode;
  map: TreeNodeMap;
  refs: Record<OutlineNode["id"], HTMLInputElement>;
}) => {
  const children = map[outline.id].children;

  if (children.length === 0) {
    return (
      <li className={styles["list-item"]}>
        ({outline.id})
        <input
          type="text"
          value={outline.text}
          onChange={() => {}}
          className={styles.input}
          ref={(el) => {
            if (el) {
              refs[outline.id] = el;
            }
          }}
        />
      </li>
    );
  }

  return (
    <li className={styles["list-item"]}>
      {outline.collapsed ? "▲" : "▼"}({outline.id})
      <input
        type="text"
        value={outline.text}
        onChange={() => {}}
        className={styles.input}
        ref={(el) => {
          if (el) {
            refs[outline.id] = el;
          }
        }}
      />
      {!outline.collapsed && (
        <ul className={styles.list}>
          {outline.children.map((childId) => {
            const childOutline = map[childId];
            return (
              <OutlineItem
                key={childId}
                outline={childOutline}
                map={map}
                refs={refs}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
};

export const Outliner = () => {
  const [normalizedMap, setNormalizedMap] = useState<TreeNodeMap>({});
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>();

  const visibleOutlineRefs = useRef<
    Record<OutlineNode["id"], HTMLInputElement>
  >({});

  const visibleOutlines = Object.values(normalizedMap).filter(
    (outline) => !outline.parent,
  );

  useEffect(() => {
    setFetchStatus("loading");
    fetchOutline()
      .then((res) => {
        const newMap = {};
        createNormalizedMap(newMap, res.nodes, undefined);
        setNormalizedMap(newMap);
        setFetchStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setFetchStatus("error");
      });
  }, []);

  const createNormalizedMap = (
    map: TreeNodeMap,
    outlines: OutlineNode[],
    parent?: OutlineNode["id"],
  ) => {
    for (const outline of outlines) {
      const { children, ...rest } = outline;
      const childrenIds = [...children].map((child) => child.id);

      map[outline.id] = {
        ...rest,
        parent,
        children: childrenIds,
      };

      createNormalizedMap(map, outline.children, outline.id);
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    let focusedElementId;

    for (const [id, element] of Object.entries(visibleOutlineRefs.current)) {
      if (element === e.target) {
        focusedElementId = id;
        break;
      }
    }

    if (!focusedElementId) return;

    const ids = Object.keys(normalizedMap);
    const indexFocusedElement = ids.indexOf(focusedElementId);

    if (e.key === "ArrowUp") {
      e.preventDefault();

      if (indexFocusedElement - 1 >= 0) {
        const nextFocusedElementId = ids[indexFocusedElement - 1];
        visibleOutlineRefs.current[nextFocusedElementId].focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();

      if (indexFocusedElement + 1 <= ids.length - 1) {
        const nextFocusedElementId = ids[indexFocusedElement + 1];
        visibleOutlineRefs.current[nextFocusedElementId].focus();
      }
    }
    // else if (e.key === "Tab") {
    // } else if (e.shiftKey && e.key === "Tab") {
    // } else if (e.key === "Backspace") {
    // } else if (e.metaKey && e.key === "ArrowUp") {
    // } else if (e.altKey && e.shiftKey && e.key === "ArrowUp") {
    // } else if (e.altKey && e.shiftKey && e.key === "ArrowDown") {
    // } else if (e.metaKey && e.keyCode === "Z") {
    // }
  };

  return (
    <div>
      <h2>Outliner</h2>
      {fetchStatus === "loading" && <p>Loading outlines...</p>}
      {fetchStatus === "error" && (
        <p>There was an issue getting your outlines.</p>
      )}
      {fetchStatus === "success" && (
        <div className={styles.container}>
          <ul className={styles.list} onKeyDown={onListKeyDown}>
            {visibleOutlines.map((outline) => {
              if (!outline.parent) {
                return (
                  <OutlineItem
                    key={outline.id}
                    outline={outline}
                    map={normalizedMap}
                    refs={visibleOutlineRefs.current}
                  />
                );
              }
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
