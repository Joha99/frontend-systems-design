/**
 * Accessible Tabs (WAI-ARIA Tabs pattern)
 *
 * Requirements:
 * 1. Tab list with 5 tabs, clicking activates, one panel visible at a time.
 * 2. ARIA: role="tablist", role="tab" with aria-selected, role="tabpanel" with tabIndex={0}.
 * 3. Roving tabIndex: active tab has tabIndex={0}, others tabIndex={-1}, .focus() on move.
 * 4. Arrow Left/Right moves focus and activates (wraps around).
 * 5. Dynamic: "Add Tab" button and close button (minimum 2 tabs).
 *    Closing the active tab activates the next (wraps to first if last).
 * 6. Panel content has at least one focusable element.
 */

import { useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./AccessibleTabs.module.css";

interface Tab {
  id: number;
  title: string;
}

interface Panel {
  id: number;
  content: ReactNode;
}

const defaultTabs: Tab[] = [
  { id: 0, title: "First tab" },
  { id: 1, title: "Second tab" },
  { id: 2, title: "Third tab" },
  { id: 3, title: "Fourth tab" },
  { id: 4, title: "Fifth tab" },
];

const defaultPanels: Record<number, Panel> = {
  0: {
    id: 0,
    content: (
      <div>
        <h2>Panel 1</h2>
        <button>Button</button>
        <button>Another button</button>
      </div>
    ),
  },
  1: {
    id: 1,
    content: (
      <div>
        <h2>Panel 2</h2>
        <button>Button</button>
        <button>Another button</button>
      </div>
    ),
  },
  2: {
    id: 2,
    content: (
      <div>
        <h2>Panel 3</h2>
        <button>Button</button>
        <button>Another button</button>
      </div>
    ),
  },
  3: {
    id: 3,
    content: (
      <div>
        <h2>Panel 4</h2>
        <button>Button</button>
        <button>Another button</button>
      </div>
    ),
  },
  4: {
    id: 4,
    content: (
      <div>
        <h2>Panel 5</h2>
        <button>Button</button>
        <button>Another button</button>
      </div>
    ),
  },
};

let nextTabId = 5;

export const AccessibleTabs = () => {
  const [activeTabId, setActiveTabId] = useState(0);
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs);
  const [panels, setPanels] = useState<Record<number, Panel>>(defaultPanels);

  const activateTab = (id: number) => {
    setActiveTabId(id);
    document.getElementById(String(id))?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== undefined) {
      activateTab(tabs[nextIndex].id);
    }
  };

  const onTabClose = (id: number) => {
    if (tabs.length <= 2) return;

    const removedIndex = tabs.findIndex((tab) => tab.id === id);

    if (id === activeTabId) {
      const nextIndex = (removedIndex + 1) % tabs.length;
      const nextId = tabs[nextIndex].id;
      activateTab(nextId === id ? tabs[0].id : nextId);
    }

    setTabs((prev) => [
      ...prev.slice(0, removedIndex),
      ...prev.slice(removedIndex + 1),
    ]);
    setPanels((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const onAddTab = () => {
    const id = nextTabId;
    nextTabId++;

    setTabs((prev) => [...prev, { id, title: `Tab #${id}` }]);
    setPanels((prev) => ({
      ...prev,
      [id]: {
        id,
        content: (
          <div>
            <h2>Panel for tab #{id}</h2>
          </div>
        ),
      },
    }));
    setActiveTabId(id);
  };

  return (
    <div>
      <h2>Accessible Tabs</h2>

      <div className={styles.container}>
        <ul className={styles.tabs} role="tablist">
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;

            return (
              <li
                key={tab.id}
                className={`${styles.tab} ${isActive ? styles.active : ""}`}
              >
                <button
                  id={String(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                >
                  {tab.title}
                </button>
                <button
                  className={styles.close}
                  onClick={() => onTabClose(tab.id)}
                  disabled={tabs.length <= 2}
                >
                  x
                </button>
              </li>
            );
          })}
          <button onClick={onAddTab}>Add tab +</button>
        </ul>
        <div className={styles.panel} role="tabpanel" tabIndex={0}>
          {panels[activeTabId].content}
        </div>
      </div>
    </div>
  );
};
