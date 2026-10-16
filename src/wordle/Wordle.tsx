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

import { useEffect, useReducer } from "react";
import styles from "./Wordle.module.css";
import { WORDS, ANSWERS } from "./words";

interface GameState {
  answer: string;
  submitted: string[];
  guess: string;
  isInvalidGuess: boolean;
}

type GuessScore = "green" | "yellow" | "gray";

type GameAction =
  | { type: "SUBMIT" }
  | { type: "DELETE" }
  | { type: "EDIT"; payload: string }
  | { type: "RESET"; payload: string }
  | { type: "CLEAR_INVALID" };

const MAX_GUESSES = 6;

// The one place that decides whether the game is over (used by the reducer and the render).
const isWon = (state: GameState) => state.submitted.at(-1) === state.answer;
const isOver = (state: GameState) =>
  isWon(state) || state.submitted.length === MAX_GUESSES;

const selectRandomAnswer = () => {
  const randomIndex = Math.floor(Math.random() * ANSWERS.length);
  return ANSWERS[randomIndex];
};

const scoreGuess = (guess: GameState["guess"], answer: GameState["answer"]) => {
  const result: GuessScore[] = new Array(5).fill(undefined);

  // create a map of characters that appear in answer to their character count
  const answerCharMap: Record<string, number> = {};
  for (const char of [...answer]) {
    if (answerCharMap[char] === undefined) {
      answerCharMap[char] = 1;
    } else {
      answerCharMap[char]++;
    }
  }

  // match "green"s first
  for (let i = 0; i < 5; i++) {
    if (answer[i] === guess[i] && answerCharMap[guess[i]] > 0) {
      result[i] = "green";
      answerCharMap[guess[i]]--;
    }
  }

  // then match "yellow"s and "gray"s
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

const reducer = (state: GameState, action: GameAction): GameState => {
  if (action.type === "RESET") {
    return {
      answer: action.payload,
      submitted: [],
      guess: "",
      isInvalidGuess: false,
    };
  }

  if (action.type === "CLEAR_INVALID") {
    return { ...state, isInvalidGuess: false };
  }

  // ignore all input once the game is over
  if (isOver(state)) {
    return state;
  }

  if (action.type === "DELETE") {
    if (state.guess.length === 0) return state;

    const newGuess = state.guess.slice(0, -1);

    return {
      ...state,
      guess: newGuess,
      isInvalidGuess: false,
    };
  }

  if (action.type === "SUBMIT") {
    const currentGuess = state.guess;

    // conditions for when user cannot submit:
    // 1. guess isn't 5 characters
    // 2. WORDS list doesn't include current 5 character guess
    if (currentGuess.length < 5) {
      return state;
    }

    if (!WORDS.includes(currentGuess)) {
      return { ...state, isInvalidGuess: true };
    }

    const newSubmitted = [...state.submitted, state.guess];

    return {
      ...state,
      submitted: newSubmitted,
      guess: "",
      isInvalidGuess: false,
    };
  }

  if (action.type === "EDIT") {
    if (state.guess.length === 5) return state;

    const newChar = action.payload.toUpperCase();
    const newGuess = state.guess + newChar;

    return {
      ...state,
      guess: newGuess,
      isInvalidGuess: false,
    };
  }

  return state;
};

export const Wordle = () => {
  // the third argument runs once, so a random answer is only picked on mount
  const [gameState, dispatch] = useReducer(reducer, null, () => ({
    answer: selectRandomAnswer(),
    submitted: [],
    guess: "",
    isInvalidGuess: false,
  }));


  const isGameWon = isWon(gameState);
  const isGameOver = isOver(gameState);
  const isGameLost = isGameOver && !isGameWon;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        dispatch({ type: "SUBMIT" });
      } else if (e.key === "Backspace") {
        dispatch({ type: "DELETE" });
      } else if (/^[a-z]$/i.test(e.key)) {
        dispatch({ type: "EDIT", payload: e.key });
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onPlayAgain = () => {
    dispatch({ type: "RESET", payload: selectRandomAnswer() });
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
        <h2>Wordle</h2>
        {isGameLost && <h3>Answer was: {gameState.answer}</h3>}
        {isGameWon && <h3>You won!</h3>}
        {gameState.isInvalidGuess && <p>Not in word list</p>}
        {isGameOver && <button onClick={onPlayAgain}>Play again</button>}
      </div>

      <div>
        {Array.from({ length: MAX_GUESSES }, (_, r) => {
          const isActiveGuess = r === gameState.submitted.length;
          const isInvalidGuess = gameState.isInvalidGuess && isActiveGuess;
          const isSubmittedGuess = r < gameState.submitted.length;
          const submittedGuessScore = isSubmittedGuess
            ? scoreGuess(gameState.submitted[r], gameState.answer)
            : undefined;

          return (
            <div
              key={r}
              className={`${styles.row} ${isInvalidGuess ? styles.invalidRow : ""}`}
              // clear the flag when the shake ends, so the next invalid Enter shakes again
              onAnimationEnd={() => dispatch({ type: "CLEAR_INVALID" })}
            >
              {Array.from({ length: 5 }, (_, c) => {
                const char = isActiveGuess
                  ? gameState.guess[c]
                  : isSubmittedGuess
                    ? gameState.submitted[r][c]
                    : "";

                return (
                  <div
                    key={`${r}:${c}`}
                    className={`${styles.cell} ${submittedGuessScore ? styles[submittedGuessScore[c]] : ""}`}
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
