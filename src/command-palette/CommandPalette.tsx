/**
 * Command Palette (VS Code / Cmd+K style)
 *
 * Requirements:
 * 1. Cmd+K opens palette overlay. Escape or click outside closes it.
 * 2. Portal overlay, auto-focused input. Save/restore focus on open/close.
 * 3. 25 commands with name and category, filtered by prefix (case-insensitive).
 * 4. Arrow Up/Down moves highlight (state-only, input keeps focus), scrollIntoView.
 * 5. Enter executes highlighted command and closes. Tab trapped in input.
 */

import React, {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./CommandPalette.module.css";

interface Command {
  id: number;
  name: string;
  category: string;
}

const commands: Command[] = [
  { id: 1, name: "New File", category: "File" },
  { id: 2, name: "Open File", category: "File" },
  { id: 3, name: "Save File", category: "File" },
  { id: 4, name: "Save All", category: "File" },
  { id: 5, name: "Close Editor", category: "File" },
  { id: 6, name: "Close All Editors", category: "File" },
  { id: 7, name: "Undo", category: "Edit" },
  { id: 8, name: "Redo", category: "Edit" },
  { id: 9, name: "Cut", category: "Edit" },
  { id: 10, name: "Copy", category: "Edit" },
  { id: 11, name: "Paste", category: "Edit" },
  { id: 12, name: "Find", category: "Edit" },
  { id: 13, name: "Replace", category: "Edit" },
  { id: 14, name: "Toggle Sidebar", category: "View" },
  { id: 15, name: "Toggle Terminal", category: "View" },
  { id: 16, name: "Zoom In", category: "View" },
  { id: 17, name: "Zoom Out", category: "View" },
  { id: 18, name: "Format Document", category: "Editor" },
  { id: 19, name: "Go to Line", category: "Editor" },
  { id: 20, name: "Go to Symbol", category: "Editor" },
  { id: 21, name: "Rename Symbol", category: "Editor" },
  { id: 22, name: "Toggle Line Comment", category: "Editor" },
  { id: 23, name: "Open Settings", category: "Preferences" },
  { id: 24, name: "Open Keyboard Shortcuts", category: "Preferences" },
  { id: 25, name: "Change Theme", category: "Preferences" },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [highlightedId, setHighlightedId] = useState<number>();

  const previousFocus = useRef<HTMLElement>(null);

  const filteredCommands = commands.filter(({ name }) =>
    name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const close = () => {
    setOpen(false);
    setHighlightedId(undefined);
    setSearchValue("");
  };

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey && e.code === "KeyK") {
        previousFocus.current = document.activeElement as HTMLElement;
        setOpen(true);
      } else if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open && previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (highlightedId !== undefined) {
      document
        .getElementById(`command-${highlightedId}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedId]);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      const command = filteredCommands.find((c) => c.id === highlightedId);
      if (command) {
        console.log(command.name);
      }
      close();
      return;
    }

    if (filteredCommands.length === 0) return;

    const highlightedIndex = filteredCommands.findIndex(
      (c) => c.id === highlightedId,
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next =
        highlightedId === undefined
          ? 0
          : (highlightedIndex + 1) % filteredCommands.length;
      setHighlightedId(filteredCommands[next].id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        highlightedId === undefined
          ? filteredCommands.length - 1
          : (highlightedIndex - 1 + filteredCommands.length) %
            filteredCommands.length;
      setHighlightedId(filteredCommands[next].id);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.currentTarget.value);
    setHighlightedId(undefined);
  };

  return (
    <div>
      <h2>Command Palette</h2>
      <button>Button outside modal</button>
      {open &&
        createPortal(
          <div
            className={styles.overlay}
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className={styles.modal}>
              {searchValue !== "" && filteredCommands.length > 0 && (
                <p className={styles.label}>
                  Showing {filteredCommands.length} of {commands.length}
                </p>
              )}
              <input
                autoFocus
                type="text"
                placeholder="Search commands..."
                value={searchValue}
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
              />
              {searchValue !== "" && filteredCommands.length === 0 ? (
                <p className={styles.label}>No results.</p>
              ) : (
                <ul className={styles.dropdown}>
                  {filteredCommands.map(({ id, name, category }) => (
                    <li
                      id={`command-${id}`}
                      key={id}
                      className={`${styles.item} ${id === highlightedId ? styles.highlighted : ""}`}
                    >
                      <span>{name}</span>
                      <span className={styles.category}>{category}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
