/**
 * Snake Game
 *
 * Build the classic Snake game with keyboard controls and score tracking.
 *
 * Requirements:
 * 1. Render a 20x20 grid. The snake starts as 3 cells in the center,
 *    moving right.
 * 2. Arrow keys change direction. Prevent 180-degree turns.
 * 3. Game loop: every 150ms, the snake moves one cell in its direction.
 *    The head moves to the next cell, the tail is removed (unless
 *    the snake just ate food).
 * 4. Food: one food cell at a time, placed at a random empty cell.
 *    When the head reaches food, the snake grows by 1 and new food appears.
 * 5. Collision detection:
 *    - Wall: head goes out of bounds. Game over.
 *    - Self: head hits any body segment. Game over.
 * 6. Score display: +10 per food eaten.
 *
 * Time target: 30 minutes.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./SnakeGame.module.css";

type Coordinate = [number, number];

const defaultSnake: Coordinate[] = [
  [10, 10],
  [10, 9],
  [10, 8],
];

const defaultApple: Coordinate = [2, 18];

const coordinatesAreEqual = (first: Coordinate, second: Coordinate) => {
  return first[0] === second[0] && first[1] === second[1];
};

const getNewAppleCoordinate = (snake: Coordinate[]): Coordinate => {
  let newApple: Coordinate;

  while (!newApple) {
    const randomCoord: Coordinate = [
      Math.floor(Math.random() * 20),
      Math.floor(Math.random() * 20),
    ];
    const overlapsWithSnake = snake.some((coord) =>
      coordinatesAreEqual(coord, randomCoord),
    );

    if (!overlapsWithSnake) {
      newApple = randomCoord;
    }
  }

  return newApple;
};

export const SnakeGame = () => {
  const [snake, setSnake] = useState<Coordinate[]>(defaultSnake);
  const [apple, setApple] = useState<Coordinate>(defaultApple);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const appleRef = useRef<Coordinate>(defaultApple);
  const snakeRef = useRef<Coordinate[]>(defaultSnake);
  const direction = useRef<Coordinate>([0, 1]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newHead: Coordinate = [
        snakeRef.current[0][0] + direction.current[0],
        snakeRef.current[0][1] + direction.current[1],
      ];
      const newSnakeWithoutTail: Coordinate[] = [
        newHead,
        ...snakeRef.current.slice(0, -1),
      ];

      const headHitWall =
        newHead[0] < 0 || newHead[0] > 19 || newHead[1] < 0 || newHead[1] > 19;
      const headHitBody = snakeRef.current
        .slice(0, -1)
        .some((coord) => coordinatesAreEqual(newHead, coord));
      const headAteApple = coordinatesAreEqual(newHead, appleRef.current);

      if (headHitWall || headHitBody) {
        clearInterval(intervalId);
        setGameOver(true);
      } else if (headAteApple) {
        const newSnakeWithTail: Coordinate[] = [newHead, ...snakeRef.current];
        setSnake(newSnakeWithTail);
        snakeRef.current = newSnakeWithTail;

        const newApple = getNewAppleCoordinate(newSnakeWithTail);
        setApple(newApple);
        appleRef.current = newApple;
        setScore((prev) => prev + 10);
      } else {
        setSnake(newSnakeWithoutTail);
        snakeRef.current = newSnakeWithoutTail;
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const [currX, currY] = direction.current;

      if (e.key === "ArrowDown" && currX !== 1 && currY !== 0) {
        e.preventDefault();
        direction.current = [1, 0];
      } else if (e.key === "ArrowUp" && currX !== -1 && currY !== 0) {
        e.preventDefault();
        direction.current = [-1, 0];
      } else if (e.key === "ArrowRight" && currX !== 0 && currY !== 1) {
        e.preventDefault();
        direction.current = [0, 1];
      } else if (e.key === "ArrowLeft" && currX !== 0 && currY !== -1) {
        e.preventDefault();
        direction.current = [0, -1];
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <h2>Snake Game</h2>
      {gameOver && <h3>Game Over!</h3>}
      <h4>Score: {score}</h4>
      <div className={`${styles.board} ${gameOver ? styles.gameOver : ""}`}>
        {Array.from({ length: 20 }, (_, r) =>
          Array.from({ length: 20 }, (_, c) => {
            const isSnake = snake.some(
              (coord) => coord[0] === r && coord[1] === c,
            );
            const isApple = apple[0] === r && apple[1] === c;
            const cell = isSnake ? "S" : isApple ? "🍎" : "";

            return (
              <div
                key={`${r}x${c}`}
                className={`${styles.cell} ${isSnake ? styles.snake : ""} ${isApple ? styles.apple : ""}`}
              >
                {cell}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
