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

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
  const [active, setActive] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [selected, setSelected] = useState<Command>();

  const prevActiveEl = useRef<Element>(null);

  const filteredResults = COMMANDS.filter((command) => {
    return command.name.toLowerCase().includes(searchInput.toLowerCase());
  });

  const hasNoResults = searchInput !== "" && filteredResults.length === 0;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          resetStates();
        } else {
          prevActiveEl.current = document.activeElement;
          setOpen(true);
        }
      } else if (e.key === "Escape" && open) {
        resetStates();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const resetStates = () => {
    setOpen(false);
    setActive(0);
    setSearchInput("");

    if (prevActiveEl.current) {
      (prevActiveEl.current as HTMLElement).focus();
    }
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (hasNoResults) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(
        (prev) => (prev - 1 + filteredResults.length) % filteredResults.length,
      );
    } else if (e.key === "Enter") {
      setSelected(filteredResults[active]);
      resetStates();
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActive(0);
    setSearchInput(e.currentTarget.value);
  };

  return (
    <div>
      <h2>Command palette</h2>
      {selected && <p>Last command: {selected.name}</p>}
      <button className={styles["outside-btn"]}>
        Has focus before palette opens
      </button>

      {open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetStates();
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
                role="combobox"
                aria-expanded={!hasNoResults}
                aria-controls="list"
                aria-activedescendant={
                  filteredResults.length > 0
                    ? filteredResults[active].id
                    : undefined
                }
                type="text"
                value={searchInput}
                className={styles.input}
                autoFocus={true}
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
              />

              {hasNoResults ? (
                <p>No commands found.</p>
              ) : (
                <ul className={styles.ul} role="listbox" id="list">
                  {filteredResults.map((command, i) => {
                    const isFocused = active === i;

                    return (
                      <li
                        id={command.id}
                        role="option"
                        aria-selected={isFocused}
                        key={command.id}
                        className={`${isFocused ? styles.focused : ""}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => {
                          setSelected(filteredResults[i]);
                          resetStates();
                        }}
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
