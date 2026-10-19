/**
 * Initial planning:
 * states:
 * - open/closed
 * - selected command (to render once modal is closed)
 * - search value (to use for filtering)
 *
 * tasks:
 * - listen to keydown
 * - cmd + k should open/close modal
 * - esc or click on the backdrop (means we need a ref attached to the child above the backdrop)
 * - set up event listener by attaching keydown event listener
 *
 * resetting states:
 * - reset when modal is closed
 *
 * a11y:
 * - role dialog on container
 * - for the overlay: aria-modal=true
 * - dialog needs a label using aria-labelledby (id of heading)
 *
 */

import { useEffect, useRef, useState } from "react";
import styles from "./CommandPalette.module.css";

type Command = {
  id: string;
  name: string;
  shortcut?: string;
};

const COMMANDS: Command[] = [
  { id: "archive", name: "Archive", shortcut: "e" },
  { id: "reply", name: "Reply", shortcut: "r" },
  { id: "forward", name: "Forward", shortcut: "f" },
  { id: "snooze", name: "Snooze", shortcut: "h" },
  { id: "star", name: "Star", shortcut: "s" },
  { id: "mark-read", name: "Mark as read", shortcut: "m" },
  { id: "compose", name: "Compose", shortcut: "c" },
  { id: "search", name: "Search", shortcut: "/" },
];

export function CommandPalette() {
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      console.log("e.key", e.key);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // this typically focuses browser's own search bar
        if (open) {
          resetPalette();
        } else {
          setOpen(true);
        }
      } else if (e.key === "Escape") {
        resetPalette();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const resetPalette = () => {
    setSearchValue("");
    setOpen(false);
  };

  const onSelectCommand = (command: Command) => {
    setSelected(command.name);
    resetPalette();
  };

  const filteredList = COMMANDS.filter((command) => {
    return command.name.toLowerCase().includes(searchValue.toLowerCase());
  });

  const hasNoResults = searchValue !== "" && filteredList.length === 0;

  return (
    <div>
      <h2>Command palette</h2>

      {selected && <p>Last command: {selected}</p>}

      <button className={styles["outside-btn"]}>
        Has focus before palette opens
      </button>

      {open && (
        <div
          onClick={(e) => {
            // if clicked in the overlay and not inside the palette
            if (e.target === e.currentTarget) {
              resetPalette();
            }
          }}
          className={styles.overlay}
        >
          <div
            role="dialog"
            aria-modal={true}
            aria-labelledby="dialog-header"
            className={styles.palette}
          >
            <header className={styles.header}>
              <h2 id="dialog-header">Command Palette</h2>
            </header>

            <div className={styles.body}>
              <label htmlFor="search-input" className={styles.label}>
                Search for a command
              </label>
              <input
                id="search-input"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.currentTarget.value)}
                className={styles.input}
                autoFocus={true}
              />

              {hasNoResults ? (
                <p>No commands found.</p>
              ) : (
                <ul className={styles.ul}>
                  {filteredList.map((command) => {
                    return (
                      <li
                        key={command.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onSelectCommand(command);
                          }
                        }}
                        onClick={() => onSelectCommand(command)}
                      >
                        {command.name}{" "}
                        {command.shortcut && `(${command.shortcut})`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
