/**
 * Minesweeper
 *
 * Build a classic Minesweeper game on a configurable grid.
 *
 * Requirements:
 * 1. Render a 10x10 grid with 15 randomly placed mines (hidden).
 * 2. Left-click reveals a cell:
 *    - If it's a mine: game over. Reveal all mines.
 *    - If it has adjacent mines: show the count (1-8).
 *    - If it has zero adjacent mines: recursively reveal all connected
 *      cells with zero adjacent mines (flood fill), plus their border
 *      cells showing counts. This is the core algorithm.
 * 3. Right-click toggles a flag on an unrevealed cell. Flagged cells
 *    can't be revealed by left-click. Show remaining flag count
 *    (total mines - flags placed).
 * 4. Win condition: all non-mine cells are revealed.
 * 5. First click is never a mine: if the first click lands on a mine,
 *    relocate that mine to a random empty cell before revealing.
 * 6. "New Game" button with difficulty selector (easy: 8x8/10 mines,
 *    medium: 10x10/15, hard: 16x16/40).
 *
 * Algorithm focus:
 * - Flood fill (BFS or DFS): when revealing a cell with 0 adjacent mines,
 *   recursively reveal all neighbors. Stop expanding at cells with count > 0
 *   (reveal them but don't recurse from them).
 * - Neighbor counting: for each cell, count mines in 8 surrounding cells.
 *   Handle grid boundaries.
 * - Mine placement: Fisher-Yates shuffle on cell indices, pick first N.
 *
 * Time target: 35 minutes.
 */

import { useState, type MouseEvent } from "react";
import styles from "./Minesweeper.module.css";

const TOTAL_CELLS = 100;
const TOTAL_MINES = 15;
const GRID_LENGTH = 10;
const ADJACENT_CELLS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
];

interface Cell {
  isMine: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
  adjacentMines: number;
}

const isValidCoordinate = (r: number, c: number) => {
  return r >= 0 && r < GRID_LENGTH && c >= 0 && c < GRID_LENGTH;
};

const setAdjacentMinesCount = (board: Cell[][]) => {
  for (let r = 0; r < GRID_LENGTH; r++) {
    for (let c = 0; c < GRID_LENGTH; c++) {
      let count = 0;
      for (const [x, y] of ADJACENT_CELLS) {
        const newR = r + x;
        const newC = c + y;
        if (isValidCoordinate(newR, newC) && board[newR][newC].isMine) {
          count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
};

const revealAdjacentCells = (
  newBoard: Cell[][],
  r: number,
  c: number,
  revealedCount: { count: number },
) => {
  for (const [x, y] of ADJACENT_CELLS) {
    const newR = r + x;
    const newC = c + y;

    if (
      isValidCoordinate(newR, newC) &&
      !newBoard[newR][newC].isFlagged &&
      !newBoard[newR][newC].isRevealed &&
      !newBoard[newR][newC].isMine
    ) {
      newBoard[newR][newC].isRevealed = true;
      revealedCount.count += 1;
      if (newBoard[newR][newC].adjacentMines === 0) {
        revealAdjacentCells(newBoard, newR, newC, revealedCount);
      }
    }
  }
};

const getRandomMines = () => {
  const mines = new Set<number>();

  while (mines.size < TOTAL_MINES) {
    const random = Math.floor(Math.random() * TOTAL_CELLS);
    if (!mines.has(random)) {
      mines.add(random);
    }
  }

  return mines;
};

const getDefaultBoard = (): Cell[][] => {
  const mines = getRandomMines();
  const board = Array.from({ length: GRID_LENGTH }, (_, r) => {
    return Array.from({ length: GRID_LENGTH }, (_, c) => {
      const isAMine = mines.has(r * GRID_LENGTH + c);
      return {
        isMine: isAMine,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      };
    });
  });
  setAdjacentMinesCount(board);
  return board;
};

export const Minesweeper = () => {
  const [board, setBoard] = useState<Cell[][]>(getDefaultBoard);
  const [gameStatus, setGameStatus] = useState<"lost" | "won">();
  const [flagCount, setFlagCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  const isAnEdge = (r: number, c: number) => {
    for (const [x, y] of ADJACENT_CELLS) {
      const newR = r + x;
      const newC = c + y;

      if (isValidCoordinate(newR, newC) && !board[newR][newC].isRevealed) {
        return true;
      }
    }
    return false;
  };

  const onCellClick = (r: number, c: number) => {
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    const newBoard = [...board.map((row) => [...row])];
    let newRevealedCount = revealedCount;
    newBoard[r][c].isRevealed = true;

    // if mine, game over
    if (cell.isMine) {
      newRevealedCount++;
      setGameStatus("lost");
    }

    // if it is adjacent to a mine, show count of adjacent mines
    else if (cell.adjacentMines > 0) {
      newRevealedCount++;
    }

    // If it has zero adjacent mines: recursively reveal all connected
    // cells with zero adjacent mines (flood fill), plus their border
    // cells showing counts.
    else if (cell.adjacentMines === 0) {
      const additionalRevealed = { count: 0 };
      revealAdjacentCells(newBoard, r, c, additionalRevealed);
      newRevealedCount += 1 + additionalRevealed.count;
    }

    if (newRevealedCount === TOTAL_CELLS - TOTAL_MINES && !cell.isMine) {
      setGameStatus("won");
    }

    setRevealedCount(newRevealedCount);
    setBoard(newBoard);
  };

  const onCellContextMenu = (
    e: MouseEvent<HTMLDivElement>,
    r: number,
    c: number,
  ) => {
    // The browser menu is the default action of `contextmenu`, not `mousedown`,
    // so it has to be cancelled here. Always cancel it, even when no flag is placed.
    e.preventDefault();

    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || flagCount >= 15) return;

    // Right-click places a flag on an unrevealed cell.
    // Flagged cells can't be revealed by left-click.
    const newBoard = [...board.map((row) => [...row])];
    newBoard[r][c].isFlagged = true;
    setFlagCount((prev) => prev + 1);
    setBoard(newBoard);
  };

  return (
    <div>
      <h2>Minesweeper</h2>
      {gameStatus === "lost" ? (
        <h2>Game is Lost!</h2>
      ) : (
        gameStatus === "won" && <h2>Game is Won!</h2>
      )}
      <h3>{flagCount} / 15 Flags Placed</h3>
      <h3>{revealedCount} Cells Revealed</h3>

      <div
        className={`${styles.grid} ${gameStatus === "lost" ? styles.gameOver : ""}`}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const { isMine, isFlagged, isRevealed, adjacentMines } = cell;
            const cellContent = isMine ? "Mine" : adjacentMines;
            const isRevealedBorder = !isMine && isRevealed && isAnEdge(r, c);

            return (
              <div
                key={`${r}-${c}`}
                className={`${styles.cell} ${isFlagged ? styles.flagged : ""} ${isRevealed ? styles.revealed : ""} ${isRevealedBorder ? styles.revealedBorder : ""}`}
                onClick={() => {
                  if (!gameStatus) {
                    onCellClick(r, c);
                  }
                }}
                onContextMenu={(e) => {
                  if (gameStatus) {
                    e.preventDefault();
                  } else {
                    onCellContextMenu(e, r, c);
                  }
                }}
              >
                {cellContent}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
