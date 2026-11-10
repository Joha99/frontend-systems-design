/**
 * Battleship (reported: Citadel, "design Battleship where players take
 * turns")
 *
 * Build Battleship: you vs. the computer, taking turns firing at each
 * other's hidden fleet.
 *
 * Requirements:
 * 1. Two 10x10 boards: yours (ships visible) and the enemy's (ships hidden).
 * 2. Fleet: Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2.
 *    Place both fleets RANDOMLY: horizontal or vertical, inside the board,
 *    never overlapping.
 * 3. Turns: you fire by clicking a cell on the enemy board. Then the
 *    computer fires at your board. You can't fire on the computer's turn,
 *    or at a cell you've already fired at.
 * 4. Each shot is a hit or a miss. When every cell of a ship has been hit,
 *    it's sunk: show "You sunk their Cruiser!" and mark the whole ship.
 * 5. Computer AI: fire at random untried cells, BUT after a hit, try the
 *    neighbors of that hit until the ship is sunk ("hunt and target").
 * 6. The game ends when one fleet is fully sunk. Show the winner and a
 *    New Game button.
 * 7. Show each side's remaining ships.
 *
 * Done when: 10 random placements are all valid, sinking a ship is
 * announced exactly once, and the computer finishes off a ship it has hit
 * instead of wandering away.
 *
 * Think about:
 * - How do you model a board so "which ship is at (r, c)?" and "is this
 *   ship sunk?" are both cheap? (Cells that store a ship id, plus a
 *   lookup of ships with their hit counts?)
 * - The computer's move happens after a short delay. Where does that timer
 *   live, and what happens if New Game is clicked before it fires?
 * - Game phases (your turn / computer's turn / game over) as one piece of
 *   state, rather than several booleans that can contradict each other.
 */

import { useState } from "react";
import styles from "./Battleship.module.css";

const BOARD_SIZE = 10;
const FLEET = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
] as const;
const DIRECTION_VECTORS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

type Cell =
  | {
      type: "fleet";
      name: (typeof FLEET)[number]["name"];
      sunk: boolean;
    }
  | { type: "water" };

const isInBounds = (row: number, column: number) => {
  return row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;
};

const cellsAreFree = (
  grid: Cell[][],
  start: [number, number],
  direction: [number, number],
  count: number,
) => {
  for (let c = 0; c < count; c++) {
    const row = start[0] + direction[0] * c;
    const col = start[1] + direction[1] * c;

    if (grid[row][col].type !== "water") {
      return false;
    }
  }

  return true;
};

const getRandomizedBoard = () => {
  const grid: Cell[][] = Array.from({ length: BOARD_SIZE }, () => {
    return Array.from({ length: BOARD_SIZE }, () => {
      return { type: "water" };
    });
  });

  for (const fleet of FLEET) {
    let direction: [number, number] =
      DIRECTION_VECTORS[Math.floor(Math.random() * DIRECTION_VECTORS.length)];
    let cell = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
    let startingLocation: [number, number] = [
      Math.floor(cell / BOARD_SIZE),
      cell % BOARD_SIZE,
    ];
    let finalLocation: [number, number] = [
      startingLocation[0] + direction[0] * (fleet.size - 1),
      startingLocation[1] + direction[1] * (fleet.size - 1),
    ];

    // if final location is not in bounds or the cells are not available, find a different direction + cell
    while (
      !isInBounds(finalLocation[0], finalLocation[1]) ||
      !cellsAreFree(grid, startingLocation, direction, fleet.size)
    ) {
      direction =
        DIRECTION_VECTORS[Math.floor(Math.random() * DIRECTION_VECTORS.length)];
      cell = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
      startingLocation = [Math.floor(cell / BOARD_SIZE), cell % BOARD_SIZE];
      finalLocation = [
        startingLocation[0] + direction[0] * (fleet.size - 1),
        startingLocation[1] + direction[1] * (fleet.size - 1),
      ];
    }

    for (let i = 0; i < fleet.size; i++) {
      const row = startingLocation[0] + direction[0] * i;
      const col = startingLocation[1] + direction[1] * i;

      grid[row][col] = { type: "fleet", name: fleet.name, sunk: false };
    }
  }

  console.log("grid", grid);
  return grid;
};

export const Battleship = () => {
  const [turn, setTurn] = useState<"computer" | "player">("player");
  const [playerBoard, setPlayerBoard] = useState<Cell[][]>(getRandomizedBoard);
  const [computerBoard, setComputerBoard] =
    useState<Cell[][]>(getRandomizedBoard);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Battleship</h2>
      {FLEET.map((fleet) => {
        return (
          <div>
            {fleet.name}: {fleet.size}
          </div>
        );
      })}

      <div>
        <h3>Player</h3>
        <div className={styles.board}>
          {playerBoard.map((row, r) => {
            return row.map((cell, c) => {
              return (
                <div key={`${r}:${c}`} className={styles.cell}>
                  {cell.type === "water" ? "" : cell.name}
                </div>
              );
            });
          })}
        </div>
      </div>

      <div>
        <h3>Computer</h3>
        <div className={styles.board}>
          {computerBoard.map((row, r) => {
            return row.map((cell, c) => {
              return (
                <div key={`${r}:${c}`} className={styles.cell}>
                  {cell.type === "water" ? "" : cell.name}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};
