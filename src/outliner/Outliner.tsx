/**
 * Keyboard-Driven Outliner (Workflowy / Roam style)
 *
 * Build a nested bullet-list editor you can navigate and extend from the
 * keyboard, with autosave.
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
 *    - Enter: create an empty sibling directly after the current bullet
 *      and focus it. (If the current bullet is expanded and has children,
 *      create it as the FIRST child instead.)
 *    - Cmd/Ctrl+ArrowUp: collapse. Cmd/Ctrl+ArrowDown: expand.
 * 5. Focus must be correct after every operation: Enter focuses the new
 *    bullet, and collapsing/expanding keeps focus on the same bullet.
 * 6. Autosave: track which node ids changed ("dirty set"). 1s after the last
 *    edit, send ONE saveChanges batch. Show "Saving…", "Saved", or
 *    "Couldn't save · Retry". Edits made while a save is in flight must not
 *    be lost (they go into the next batch), and only one save may be in
 *    flight at a time. A failed batch is merged back into the dirty set.
 *
 * Stretch:
 * - Tab: indent (become the last child of the previous sibling; children
 *   move with it). Shift+Tab: outdent (become the next sibling of the
 *   parent). The same bullet keeps focus and the caret keeps its offset.
 * - Backspace on an EMPTY bullet with no children deletes it and focuses
 *   the previous visible bullet (caret at end).
 * - Alt+Shift+ArrowUp / ArrowDown: move the bullet (with its subtree)
 *   above / below its sibling.
 * - Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z: undo / redo structural operations.
 * - Enter in the middle of text splits the bullet at the caret.
 * - Clicking a bullet dot "zooms" into it: it becomes the root, with a
 *   breadcrumb trail back to the top.
 * - Handle a CONFLICT by refetching and telling the user.
 *
 * Data structure focus:
 * - Normalized tree: O(1) lookup by id, parent pointers, ordered child ids.
 * - Flattening a tree into visible order (DFS with pruning).
 * - A dirty set for batched saves.
 *
 * Discussion questions:
 * - How would indent/outdent work in your model vs. the nested one?
 * - How would you render a 50,000-bullet outline smoothly?
 * - How would you support two people editing the same outline live?
 *
 * Time target: 60 minutes.
 */

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
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
  onInputChange,
}: {
  outline: TreeNode;
  map: TreeNodeMap;
  refs: Record<OutlineNode["id"], HTMLInputElement>;
  onInputChange: (id: OutlineNode["id"], newText: string) => void;
}) => {
  const children = map[outline.id].children;

  if (children.length === 0) {
    return (
      <li className={styles["list-item"]}>
        ({outline.id})
        <input
          type="text"
          placeholder="Write an outline"
          value={outline.text}
          className={styles.input}
          ref={(el) => {
            if (el) {
              refs[outline.id] = el;
            }
          }}
          onChange={(e) => {
            const newText = e.currentTarget.value;
            onInputChange(outline.id, newText);
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
        placeholder="Write an outline"
        className={styles.input}
        ref={(el) => {
          if (el) {
            refs[outline.id] = el;
          }
        }}
        onChange={(e) => {
          const newText = e.currentTarget.value;
          onInputChange(outline.id, newText);
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
                onInputChange={onInputChange}
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
  const [nextId, setNextId] = useState<number>(11);

  const [focusedOutlineId, setFocusedOutlineId] = useState<TreeNode["id"]>();
  const [version, setVersion] = useState<number>();

  const visibleOutlineRefs = useRef<
    Record<OutlineNode["id"], HTMLInputElement>
  >({});

  useEffect(() => {
    setFetchStatus("loading");
    fetchOutline()
      .then((res) => {
        const newMap: TreeNodeMap = {
          root: {
            id: "root",
            text: "",
            collapsed: false,
            parent: undefined,
            children: [],
          },
        };
        for (const outline of res.nodes) {
          newMap.root.children.push(outline.id);
        }
        createNormalizedMap(newMap, res.nodes, "root");
        console.log("normalized", newMap);

        setNormalizedMap(newMap);
        setVersion(res.version);
        setFetchStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setFetchStatus("error");
      });
  }, []);

  useEffect(() => {
    if (focusedOutlineId !== undefined) {
      visibleOutlineRefs.current[focusedOutlineId].focus();
    }
  }, [focusedOutlineId]);

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

  const getVisibleOrder = (id: TreeNode["id"], list: TreeNode["id"][]) => {
    list.push(id);

    const node = normalizedMap[id];
    if (!node.collapsed) {
      for (const childId of node.children) {
        getVisibleOrder(childId, list);
      }
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    let focusedId;

    // get the ID for the current focused element
    for (const [id, element] of Object.entries(visibleOutlineRefs.current)) {
      if (element === e.target) {
        focusedId = id;
        break;
      }
    }

    if (!focusedId) return;

    // get the index of the outline with a matching index
    const visibleOrder: TreeNode["id"][] = [];
    normalizedMap["root"].children.forEach((childId) => {
      getVisibleOrder(childId, visibleOrder);
    });
    console.log(visibleOrder);

    const focusedIndex = visibleOrder.indexOf(focusedId);
    const focusedOutline = normalizedMap[focusedId];

    if (e.metaKey && e.key === "ArrowUp") {
      const newMap = { ...normalizedMap };
      newMap[focusedId] = {
        ...newMap[focusedId],
        collapsed: true,
      };
      setNormalizedMap(newMap);

      // TODO: save changes
    } else if (e.metaKey && e.key === "ArrowDown") {
      const newMap = { ...normalizedMap };
      newMap[focusedId] = {
        ...newMap[focusedId],
        collapsed: false,
      };
      setNormalizedMap(newMap);

      // TODO: save changes
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      if (focusedIndex - 1 >= 0) {
        const nextFocusedElementId = visibleOrder[focusedIndex - 1];
        setFocusedOutlineId(nextFocusedElementId);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();

      if (focusedIndex + 1 <= visibleOrder.length - 1) {
        const nextFocusedElementId = visibleOrder[focusedIndex + 1];
        setFocusedOutlineId(nextFocusedElementId);
      }
    } else if (e.key === "Enter" && !focusedOutline.collapsed) {
      const newNormalizedMap = { ...normalizedMap };
      const focusedOutline = newNormalizedMap[focusedId];

      const sharedParentId =
        focusedOutline.children.length > 0
          ? focusedOutline.id
          : focusedOutline.parent;

      console.log("focused", focusedOutline);
      console.log("parent id", sharedParentId);

      const newId = `n${nextId}`;
      const newOutline: TreeNode = {
        id: newId,
        text: "",
        collapsed: false,
        parent: sharedParentId,
        children: [],
      };

      if (focusedOutline.children.length > 0) {
        newNormalizedMap[focusedId] = {
          ...newNormalizedMap[focusedId],
          children: [newId, ...focusedOutline.children],
        };
      } else {
        if (sharedParentId) {
          const sharedParent = newNormalizedMap[sharedParentId];
          const insertIndex = sharedParent.children.indexOf(focusedId);
          newNormalizedMap[sharedParentId] = {
            ...newNormalizedMap[sharedParentId],
            children: [
              ...sharedParent.children.slice(0, insertIndex + 1),
              newId,
              ...sharedParent.children.slice(insertIndex + 1),
            ],
          };
        }
      }

      setNormalizedMap(() => {
        newNormalizedMap[newId] = newOutline;
        return newNormalizedMap;
      });

      setFocusedOutlineId(newId);
      setNextId((prev) => prev + 1);

      // TODO: save changes
    }
  };

  const onInputChange = (id: OutlineNode["id"], newText: string) => {
    const newMap = { ...normalizedMap };
    newMap[id] = {
      ...newMap[id],
      text: newText,
    };
    setNormalizedMap(newMap);

    // TODO: save changes
  };

  const onInputFocus = (e: FocusEvent) => {
    console.log(e.target);

    let focusedId;

    // get the ID for the current focused element
    for (const [id, element] of Object.entries(visibleOutlineRefs.current)) {
      if (element === e.target) {
        focusedId = id;
        break;
      }
    }

    if (!focusedId) return;

    setFocusedOutlineId(focusedId);
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
          <ul
            className={styles.list}
            onKeyDown={onListKeyDown}
            onFocus={onInputFocus}
          >
            {normalizedMap["root"].children.map((childId) => {
              const childOutline = normalizedMap[childId];

              return (
                <OutlineItem
                  key={childOutline.id}
                  outline={childOutline}
                  map={normalizedMap}
                  refs={visibleOutlineRefs.current}
                  onInputChange={onInputChange}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
