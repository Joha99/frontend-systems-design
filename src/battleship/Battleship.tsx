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
 *
 * 4. Each shot is a hit or a miss. When every cell of a ship has been hit,
 *    it's sunk: show "You sunk their Cruiser!" and mark the whole ship.
 *
 * 5. Computer AI: fire at random untried cells, BUT after a hit, try the
 *    neighbors of that hit until the ship is sunk ("hunt and target").
 *
 * 6. The game ends when one fleet is fully sunk. Show the winner and a
 *    New Game button.
 *
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

import { useEffect, useState } from "react";
import styles from "./Battleship.module.css";

const BOARD_SIZE = 10;
const FLEET = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
] as const;
const TOTAL_FLEET_SIZE = 5 + 4 + 3 + 3 + 2;
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

const getRandomCell = (): [number, number] => {
  const cell = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
  const coordinates: [number, number] = [
    Math.floor(cell / BOARD_SIZE),
    cell % BOARD_SIZE,
  ];

  return coordinates;
};

const getRandomDirection = (): [number, number] => {
  return DIRECTION_VECTORS[
    Math.floor(Math.random() * DIRECTION_VECTORS.length)
  ];
};

const getRandomizedBoard = () => {
  const grid: Cell[][] = Array.from({ length: BOARD_SIZE }, () => {
    return Array.from({ length: BOARD_SIZE }, () => {
      return { type: "water" };
    });
  });

  for (const fleet of FLEET) {
    let direction = getRandomDirection();
    let startingLocation = getRandomCell();
    let finalLocation = [
      startingLocation[0] + direction[0] * (fleet.size - 1),
      startingLocation[1] + direction[1] * (fleet.size - 1),
    ];

    while (
      !isInBounds(finalLocation[0], finalLocation[1]) ||
      !cellsAreFree(grid, startingLocation, direction, fleet.size)
    ) {
      direction = getRandomDirection();
      startingLocation = getRandomCell();
      finalLocation = [
        startingLocation[0] + direction[0] * (fleet.size - 1),
        startingLocation[1] + direction[1] * (fleet.size - 1),
      ];
    }

    for (let i = 0; i < fleet.size; i++) {
      const row = startingLocation[0] + direction[0] * i;
      const col = startingLocation[1] + direction[1] * i;
      grid[row][col] = { type: "fleet", name: fleet.name };
    }
  }

  return grid;
};

const getDefaultSunkFleets = (): Record<
  (typeof FLEET)[number]["name"],
  Set<string>
> => {
  return {
    Battleship: new Set(),
    Carrier: new Set(),
    Cruiser: new Set(),
    Destroyer: new Set(),
    Submarine: new Set(),
  };
};

const isAllShipsSunk = (
  sunkFleets: Record<(typeof FLEET)[number]["name"], Set<string>>,
) => {
  return (
    sunkFleets.Battleship.size === 4 &&
    sunkFleets.Carrier.size === 5 &&
    sunkFleets.Cruiser.size === 3 &&
    sunkFleets.Submarine.size === 3 &&
    sunkFleets.Destroyer.size === 2
  );
};

const getCellKey = (row: number, column: number) => {
  return `${row}:${column}`;
};

export const Battleship = () => {
  const [turn, setTurn] = useState<"computer" | "player">("player");

  const [playerBoard, setPlayerBoard] = useState<Cell[][]>(getRandomizedBoard);
  const [playerSunkFleets, setPlayerSunkFleets] =
    useState<Record<(typeof FLEET)[number]["name"], Set<string>>>(
      getDefaultSunkFleets,
    );

  const [computerBoard, setComputerBoard] =
    useState<Cell[][]>(getRandomizedBoard);
  const [computerSunkFleets, setComputerSunkFleets] =
    useState<Record<(typeof FLEET)[number]["name"], Set<string>>>(
      getDefaultSunkFleets,
    );

  const playerWon = isAllShipsSunk(computerSunkFleets);
  const computerWon = isAllShipsSunk(playerSunkFleets);
  const winner = playerWon ? "player" : computerWon ? "computer" : undefined;

  const remainingPlayerShips =
    TOTAL_FLEET_SIZE -
    (playerSunkFleets.Battleship.size +
      playerSunkFleets.Carrier.size +
      playerSunkFleets.Cruiser.size +
      playerSunkFleets.Destroyer.size +
      playerSunkFleets.Submarine.size);

  const onComputerBoardCellClick = (row: number, column: number) => {
    const cell = computerBoard[row][column];
    const cellKey = getCellKey(row, column);

    if (cell.type === "fleet" && !computerSunkFleets[cell.name].has(cellKey)) {
      setComputerSunkFleets((prev) => {
        const newComputerSunkFleets = { ...prev };
        newComputerSunkFleets[cell.name] = new Set([
          ...newComputerSunkFleets[cell.name],
          cellKey,
        ]);

        return newComputerSunkFleets;
      });
    }

    setTurn("computer");
  };

  useEffect(() => {
    if (winner !== undefined || turn === "player") {
      return;
    }

    // computer's turn
    setTimeout(() => {
      const coord = getRandomCell();
      const cell = playerBoard[coord[0]][coord[1]];
      const cellKey = getCellKey(coord[0], coord[1]);

      console.log("computer striked:", cell, " at ", coord);

      if (cell.type === "fleet" && !playerSunkFleets[cell.name].has(cellKey)) {
        setPlayerSunkFleets((prev) => {
          const newPlayerSunkFleets = { ...prev };
          newPlayerSunkFleets[cell.name] = new Set([
            ...newPlayerSunkFleets[cell.name],
            cellKey,
          ]);

          return newPlayerSunkFleets;
        });
      }

      setTurn("player");
    }, 300);
  }, [turn]);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2>Battleship</h2>
      <h3>{winner ? `${winner} won!` : `Turn: ${turn}`}</h3>

      <div className={styles.boards}>
        <div>
          <h3>Player</h3>
          <div className={styles.board}>
            {playerBoard.map((row, r) => {
              return row.map((cell, c) => {
                const cellKey = getCellKey(r, c);
                const isSunk =
                  cell.type === "fleet" &&
                  playerSunkFleets[cell.name].has(cellKey);

                return (
                  <div
                    key={`${r}:${c}`}
                    className={`${styles.cell} ${isSunk ? styles.sunkShip : ""}`}
                  >
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
                const cellKey = getCellKey(r, c);
                const isSunk =
                  cell.type === "fleet" &&
                  computerSunkFleets[cell.name].has(cellKey);

                return (
                  <button
                    key={`${r}:${c}`}
                    className={`${styles.cell} ${styles.computerCell} ${isSunk ? styles.sunkShip : ""}`}
                    disabled={turn !== "player" || isSunk}
                    onClick={() => onComputerBoardCellClick(r, c)}
                  >
                    {cell.type === "water" ? "" : cell.name}
                  </button>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
