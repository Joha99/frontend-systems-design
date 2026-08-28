/**
 * Dropdown Multi-Select with Chips (from Retell AI recruiter)
 *
 * Build a MultiSelect component. Users type to filter a list of options;
 * selecting one adds it as a removable chip inside the input.
 *
 * Requirements:
 * 1. Filter the options list as the user types (case-insensitive, matches anywhere in the label).
 * 2. Clicking an option adds it as a chip inside the input box; the text input clears, option removed from dropdown.
 * 3. Each chip has an x button that removes it from the selection.
 * 4. Options with disabled: true must appear in the dropdown (greyed out) but cannot be clicked or selected.
 * 5. Clicking anywhere outside the component closes the dropdown.
 * 6. When the filter text matches no options, show a "No results" empty state instead of an empty dropdown.
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import styles from "./MultiSelect.module.css";

interface Option {
  label: string;
  disabled?: boolean;
}

const OPTIONS: Option[] = [
  { label: "React" },
  { label: "TypeScript" },
  { label: "Next.js", disabled: true },
  { label: "Tailwind CSS" },
  { label: "GraphQL", disabled: true },
  { label: "Node.js" },
  { label: "PostgreSQL" },
  { label: "Redis", disabled: true },
  { label: "Docker" },
  { label: "Kubernetes" },
  { label: "AWS" },
  { label: "Figma" },
  { label: "Jest" },
  { label: "Cypress", disabled: true },
  { label: "Storybook" },
  { label: "Webpack" },
  { label: "Vite" },
  { label: "ESLint" },
  { label: "Prisma", disabled: true },
  { label: "tRPC" },
];

export const MultiSelect = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Set<Option["label"]>>(
    new Set(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
  };

  const onSelectItem = (label: Option["label"]) => {
    setSelectedOptions((prev) => new Set([...prev, label]));
    setInputValue("");
  };

  const onRemoveItem = (label: Option["label"]) => {
    setSelectedOptions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(label);
      return newSet;
    });
  };

  const filteredOptions = useMemo(() => {
    if (inputValue === "") {
      return [];
    }

    return OPTIONS.filter(({ label }) => {
      return (
        !selectedOptions.has(label) &&
        label.toLowerCase().includes(inputValue.toLowerCase())
      );
    });
  }, [inputValue, selectedOptions]);

  return (
    <>
      <p>Multi-Select with Chips</p>

      <div className={styles.container} ref={containerRef}>
        <div className={styles.chipInput}>
          {[...selectedOptions].map((label) => (
            <span key={label} className={styles.chip}>
              {label}
              <button
                className={styles.removeButton}
                onClick={() => onRemoveItem(label)}
              >
                x
              </button>
            </span>
          ))}
          <input
            className={styles.input}
            type="text"
            placeholder="Filter the options"
            value={inputValue}
            onChange={onInputChange}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {inputValue !== "" && filteredOptions.length === 0 && (
          <div className={styles.emptyState}>
            There are no options that match your search.
          </div>
        )}

        {isOpen && filteredOptions.length > 0 && (
          <div className={styles.dropdown}>
            <ul>
              {filteredOptions.map((option) => (
                <li key={option.label}>
                  <button
                    className={
                      option.disabled
                        ? styles.optionDisabled
                        : styles.optionButton
                    }
                    disabled={option.disabled}
                    onClick={() => onSelectItem(option.label)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
