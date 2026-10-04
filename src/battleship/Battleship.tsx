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
 *
 * Stretch:
 * - Let the player place their own ships (click + R to rotate) before the
 *   game starts.
 * - Keyboard play: arrow keys move a target cursor on the enemy board,
 *   Enter fires.
 * - Two-player hot-seat mode with a "pass the device" screen between turns.
 *
 * Time target: 60 minutes.
 */

import styles from "./Battleship.module.css";

const BOARD_SIZE = 10;
const FLEET = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
] as const;

export const Battleship = () => {
  // TODO: implement
  void [BOARD_SIZE, FLEET];

  return (
    <div>
      <h2>Battleship</h2>
    </div>
  );
};
