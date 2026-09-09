/**
 * Interactive Spreadsheet
 *
 * Build a simplified Excel-like spreadsheet component.
 *
 * Requirements:
 * 1. Render a grid of editable cells (e.g. 10 rows x 6 columns).
 * 2. Column headers show letters (A, B, C, ...), row headers show numbers (1, 2, 3, ...).
 * 3. Clicking a cell selects it (highlighted border). Clicking outside deselects.
 *    Use useRef + document event listener for outside click detection.
 * 4. Double-clicking or pressing Enter on a selected cell enters edit mode (shows an input).
 * 5. Pressing Enter or Tab commits the edit and moves selection (Enter -> down, Tab -> right).
 * 6. Pressing Escape cancels the edit and restores the previous value.
 * 7. Arrow keys move the selection between cells when not editing.
 * 8. Store cell data in a Record keyed by "A1", "B2", etc.
 * 9. Formula support: cells starting with "=" evaluate expressions:
 *    - =A1+B1 (cell references with +, -, *, /)
 *    - =SUM(A1:A10) -- sum a range of cells
 *    - =AVG(A1:A10) -- average a range of cells
 *    - Parse column letter + row number to resolve cell references.
 *      Think about: converting "A" -> 0, "B" -> 1, parsing "A10" into col=0, row=9.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "./Spreadsheet.css";

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const COLUMNS = ["A", "B", "C", "D", "E", "F"] as const;
const MIN_COL_CODE = COLUMNS[0].charCodeAt(0);
const MAX_COL_CODE = COLUMNS[COLUMNS.length - 1].charCodeAt(0);

type Row = (typeof ROWS)[number];
type Column = (typeof COLUMNS)[number];

export const Spreadsheet = () => {
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const [spreadsheet, setSpreadsheet] = useState<Record<string, string>>({
    A1: "hello world",
  });
  const [selectedCell, setSelectedCell] = useState<[Row, Column]>();
  const [editedCell, setEditedCell] = useState<[Row, Column]>();
  const [editedCellValue, setEditedCellValue] = useState("");

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        spreadsheetRef.current &&
        !spreadsheetRef.current.contains(e.target as Node)
      ) {
        setSelectedCell(undefined);
        setEditedCell(undefined);
        setEditedCellValue("");
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const navigateToCell = (rowOffset: number, colOffset: number) => {
    const origin = selectedCell ?? editedCell;
    if (!origin) return;

    const newRow = Math.max(1, Math.min(10, origin[0] + rowOffset));
    const newColCode = Math.max(
      MIN_COL_CODE,
      Math.min(MAX_COL_CODE, origin[1].charCodeAt(0) + colOffset),
    );
    const newColumn = String.fromCharCode(newColCode);

    setSelectedCell([newRow as Row, newColumn as Column]);
    document.getElementById(`${newColumn}${newRow}`)?.focus();
  };

  const commitEdit = (cellKey: string) => {
    const value = editedCellValue || spreadsheet[cellKey];
    setSpreadsheet((prev) => ({ ...prev, [cellKey]: value }));
    setEditedCell(undefined);
    setEditedCellValue("");
  };

  const onClickCell = ([row, column]: [Row, Column]) => {
    setSelectedCell([row, column]);
    document.getElementById(`${column}${row}`)?.focus();

    if (editedCell && !(editedCell[0] === row && editedCell[1] === column)) {
      setEditedCell(undefined);
      setEditedCellValue("");
    }
  };

  const onDoubleClickCell = ([row, column]: [Row, Column]) => {
    setSelectedCell(undefined);
    setEditedCell([row, column]);
  };

  const onKeyDownCell = (e: KeyboardEvent) => {
    if (!selectedCell) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateToCell(-1, 0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateToCell(0, 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateToCell(1, 0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateToCell(0, -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      setEditedCell([selectedCell[0], selectedCell[1]]);
      setSelectedCell(undefined);
    }
  };

  const onKeyDownEditedCell = (e: KeyboardEvent) => {
    if (!editedCell) return;

    e.stopPropagation();

    const cellKey = `${editedCell[1]}${editedCell[0]}`;

    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(cellKey);
      navigateToCell(1, 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitEdit(cellKey);
      navigateToCell(0, 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSelectedCell([editedCell[0], editedCell[1]]);
      document.getElementById(cellKey)?.focus();
      setEditedCell(undefined);
      setEditedCellValue("");
    }
  };

  return (
    <div className="spreadsheet" ref={spreadsheetRef}>
      <div className="grid-header">
        <div className="grid-corner-cell">#</div>
        {COLUMNS.map((column) => (
          <div className="grid-header-cell" key={column}>
            {column}
          </div>
        ))}
      </div>

      {ROWS.map((row) => (
        <div className="grid-row" key={row}>
          <div className="grid-row-number">{row}</div>
          {COLUMNS.map((column) => {
            const cellKey = `${column}${row}`;
            const cellContent = spreadsheet[cellKey] ?? "";
            const isSelected =
              selectedCell?.[0] === row && selectedCell?.[1] === column;
            const isEditing =
              editedCell?.[0] === row && editedCell?.[1] === column;

            return (
              <div
                key={cellKey}
                id={cellKey}
                tabIndex={isEditing ? undefined : 0}
                className={`grid-cell ${isSelected ? "grid-selected-cell" : ""}`}
                onClick={() => onClickCell([row, column])}
                onDoubleClick={() => onDoubleClickCell([row, column])}
                onKeyDown={onKeyDownCell}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    placeholder={spreadsheet[cellKey]}
                    value={editedCellValue}
                    className="grid-text-area"
                    onChange={(e) => setEditedCellValue(e.currentTarget.value)}
                    onKeyDown={onKeyDownEditedCell}
                  />
                ) : (
                  cellContent
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
