/**
 * Wordle
 *
 * Build Wordle: guess a 5-letter word in 6 tries.
 *
 * Data: ./words.ts exports ANSWERS (possible answers) and WORDS (all valid
 * guesses, including every answer).
 *
 * Requirements:
 * 1. Pick a random answer. Render a 6x5 grid of letter tiles.
 * 2. Typing: listen for physical keyboard input on the document.
 *    Letters fill the current row, Backspace deletes, Enter submits.
 *    Ignore input once the game is over.
 * 3. Enter on a row that isn't 5 letters, or isn't in WORDS, doesn't submit.
 *    Show a message ("Not in word list") and shake the row.
 * 4. Scoring a guess. This is the core algorithm. Each letter is:
 *    - green: right letter, right spot
 *    - yellow: in the word, wrong spot
 *    - gray: not in the word, OR all copies of it are already used up
 *    Duplicate letters are the tricky part. Example:
 *      answer LEVER, guess EERIE → yellow, green, yellow, gray, gray
 *    (Only ONE E is left after the green E, so the last E is gray.)
 * 5. An on-screen keyboard that also works by clicking. Each key shows the
 *    BEST status that letter has had so far (green beats yellow beats gray).
 * 6. Win when a row is all green; lose after 6 wrong guesses and reveal
 *    the answer. A Play Again button starts a new game.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./Wordle.module.css";
import { WORDS, ANSWERS } from "./words";

type GuessScore = "green" | "yellow" | "gray";
type GameStatus = "won" | "lost" | "invalid";

const selectRandomAnswer = () => {
  const randomIndex = Math.floor(Math.random() * ANSWERS.length);
  return ANSWERS[randomIndex];
};

export const Wordle = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>();
  const [answer, setAnswer] = useState<string>("LEVER");

  const [submittedGuesses, setSubmittedGuesses] = useState<string[]>([]);
  const submittedGuessesCountRef = useRef<number>(0);

  const [currentGuess, setCurrentGuess] = useState<string>("");
  const currentGuessRef = useRef<string>("");

  console.log("answer", answer);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[a-z]$/i.test(e.key)) {
        if (currentGuessRef.current.length === 5) {
          return;
        }

        const uppercaseChar = e.key.toUpperCase();
        setCurrentGuess((prev) => prev + uppercaseChar);
        currentGuessRef.current += uppercaseChar;
      } else if (e.key === "Backspace" && currentGuessRef.current.length > 0) {
        setCurrentGuess((prev) => prev.slice(0, -1));
        currentGuessRef.current = currentGuessRef.current.slice(0, -1);
      } else if (e.key === "Enter") {
        onSubmit();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onSubmit = () => {
    const guess = currentGuessRef.current;

    if (guess.length < 5) {
      return;
    }

    if (!WORDS.includes(guess)) {
      setGameStatus("invalid");
      return;
    }

    if (guess === answer) {
      setGameStatus("won");
    }

    if (submittedGuessesCountRef.current === 5 && guess !== answer) {
      setGameStatus("lost");
    }

    setSubmittedGuesses((prev) => [...prev, guess]);
    submittedGuessesCountRef.current++;
    setCurrentGuess("");
    currentGuessRef.current = "";
  };

  const scoreGuess = (guess: string) => {
    const result: GuessScore[] = new Array(5).fill(undefined);

    const answerCharMap: Record<string, number> = {};
    for (const char of [...answer]) {
      if (answerCharMap[char] === undefined) {
        answerCharMap[char] = 1;
      } else {
        answerCharMap[char]++;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (answer[i] === guess[i] && answerCharMap[guess[i]] > 0) {
        result[i] = "green";
        answerCharMap[guess[i]]--;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (result[i] === "green") {
        continue;
      }

      if (answer[i] !== guess[i] && answerCharMap[guess[i]] > 0) {
        result[i] = "yellow";
        answerCharMap[guess[i]]--;
      } else {
        result[i] = "gray";
      }
    }

    return result;
  };

  const onPlayAgain = () => {
    setGameStatus(undefined);
    setAnswer(selectRandomAnswer);

    setSubmittedGuesses([]);
    submittedGuessesCountRef.current = 0;

    setCurrentGuess("");
    currentGuessRef.current = "";
  };

  const isGameOver = gameStatus === "lost" || gameStatus === "won";

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        <h2>Wordle</h2>
        {gameStatus === "lost" && <h3>Answer was: {answer}</h3>}
        {gameStatus === "invalid" && <h3>Not in the words list</h3>}
        {isGameOver && <button onClick={onPlayAgain}>Play again</button>}
      </div>

      <div>
        {Array.from({ length: 6 }, (_, r) => {
          const isActiveGuess = r === submittedGuesses.length;
          const isInvalidGuess = isActiveGuess && gameStatus === "invalid";
          const isSubmittedGuess = r < submittedGuesses.length;
          const guessScore = isSubmittedGuess
            ? scoreGuess(submittedGuesses[r])
            : undefined;

          return (
            <div
              key={r}
              className={`${styles.row} ${isInvalidGuess ? styles.invalidRow : ""}`}
              onAnimationEnd={() => {
                setGameStatus(undefined);
              }}
            >
              {Array.from({ length: 5 }, (_, c) => {
                const char = isActiveGuess
                  ? currentGuess?.[c]
                  : isSubmittedGuess
                    ? submittedGuesses[r][c]
                    : "";

                return (
                  <div
                    key={`${r}:${c}`}
                    className={`${styles.cell} ${guessScore ? styles[guessScore[c]] : ""}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
