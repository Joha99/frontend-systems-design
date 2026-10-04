/**
 * Whack-a-Mole
 *
 * Build Whack-a-Mole with a countdown timer.
 *
 * Requirements:
 * 1. A 3x3 grid of holes. Start begins a 30-second game with a countdown.
 * 2. Every 800ms a mole appears in a random hole (never the same hole twice
 *    in a row) and stays up for 700ms unless whacked.
 * 3. Clicking a mole that's up scores +1 and hides it immediately.
 *    Clicking an empty hole does nothing.
 * 4. Keyboard: keys 1–9 whack the matching hole (1 = top-left, like a
 *    phone keypad or numpad layout, your choice; document it).
 * 5. When time runs out, stop everything, show the final score, and allow
 *    a new game.
 * 6. No leaks: all intervals and timeouts are cleared when the game ends,
 *    when a new game starts, and on unmount.
 *
 * Done when: scores are never lost or double-counted, even when clicking
 * very fast, and nothing keeps running after the game ends.
 *
 * Think about:
 * - Your interval callback updates the score and the mole. Will it see the
 *   latest values? (Same trap as the stale-closure quiz questions.)
 * - One interval driving everything vs. separate timers per mole: which is
 *   easier to clean up?
 *
 * Stretch:
 * - Difficulty levels (faster moles, shorter up-time).
 * - Several moles up at once.
 * - Pause/resume that also pauses the countdown.
 *
 * Time target: 30 minutes.
 */

import { useEffect, useState } from "react";
import styles from "./WhackAMole.module.css";

export const WhackAMole = () => {
  const [gameStatus, setGameStatus] = useState<"started" | "over">();
  const [gameTimer, setGameTimer] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [mole, setMole] = useState<number>();

  // Reset mole every 1 second
  useEffect(() => {
    if (mole === undefined) return;

    let intervalId = setInterval(() => {
      createNewMole();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [mole]);

  // Listen to game status and start countdown
  useEffect(() => {
    if (!gameStatus || gameStatus === "over") return;

    let intervalId: number;
    if (gameStatus === "started") {
      // Countdown starts
      intervalId = setInterval(() => {
        setGameTimer((prev) => {
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [gameStatus]);

  // Reset game state when timer runs out
  useEffect(() => {
    if (gameTimer === 0) {
      setGameStatus("over");
      setMole(undefined);
    }
  }, [gameTimer]);

  // Generate a new mole location
  const createNewMole = () => {
    let randomIndex = Math.floor(Math.random() * 9);
    if (mole !== undefined && randomIndex === mole) {
      while (randomIndex === mole) {
        randomIndex = Math.floor(Math.random() * 9);
      }
    }
    setMole(randomIndex);
  };

  // Set initial states when game starts
  const onGameStart = () => {
    setGameTimer(30);
    setScore(0);
    setGameStatus("started");
    createNewMole();
  };

  const onCellClick = (index: number) => {
    if (index === mole) {
      createNewMole();
      setScore((prev) => prev + 1);
    }
  };

  return (
    <div>
      <h2>Whack-a-Mole</h2>

      {!gameStatus ? (
        <button onClick={onGameStart}>Start</button>
      ) : gameStatus === "started" ? (
        <div>
          {gameTimer} SECONDS | SCORE: {score}
        </div>
      ) : (
        <div>
          Game over! Final score is {score}.
          <button onClick={onGameStart}>Play again</button>
        </div>
      )}

      <div className={styles.grid}>
        {Array.from({ length: 9 }, (_, i) => {
          const hasMole = mole === i;

          return (
            <button
              key={i}
              className={`${styles.cell} ${hasMole ? styles.mole : ""}`}
              onClick={() => onCellClick(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
