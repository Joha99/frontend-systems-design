/**
 * Memory Card Game
 *
 * Build a card matching game where the player flips pairs of cards
 * to find matches.
 *
 * Requirements:
 * 1. Render a 4x4 grid of face-down cards (16 cards = 8 pairs).
 *    Each pair has a matching emoji or symbol.
 * 2. Clicking a face-down card flips it face-up (shows its symbol).
 *    The player can flip at most 2 cards at a time.
 * 3. If the two flipped cards match: keep them face-up (mark as matched).
 *    If they don't match: flip both back face-down after a 1-second delay.
 * 4. During the 1-second delay, additional clicks are ignored.
 * 5. Move counter: increment after each pair attempt (not each click).
 * 6. Win condition: all pairs matched. Show "You won in X moves!"
 *
 * Algorithm focus:
 * - Shuffle: Fisher-Yates shuffle to randomize card positions.
 *   Create array of pairs [A,A,B,B,C,C,...], shuffle it.
 * - State tracking: each card has { id, symbol, isFlipped, isMatched }.
 *   "flipped" = temporarily shown, "matched" = permanently shown.
 * - Comparison: when 2 cards are flipped, compare their symbols.
 *
 * Time target: 20 minutes.
 */

import { useMemo, useState } from "react";
import styles from "./MemoryGame.module.css";

const CARDS = [
  "A",
  "A",
  "B",
  "B",
  "C",
  "C",
  "D",
  "D",
  "E",
  "E",
  "F",
  "F",
  "G",
  "G",
  "H",
  "H",
] as const;

const getRandomizedCards = () => {
  const randomizedArray = [...CARDS];

  for (let i = CARDS.length - 1; i > 0; i--) {
    // create index between 0 and i (inclusive)
    const indexToSwapWith = Math.floor(Math.random() * (i + 1));

    // swap two elements in array using modern JS syntax
    [randomizedArray[i], randomizedArray[indexToSwapWith]] = [
      randomizedArray[indexToSwapWith],
      randomizedArray[i],
    ];
  }

  return randomizedArray;
};

export const MemoryGame = () => {
  const [turn, setTurn] = useState(1);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchingCards, setMatchingCards] = useState<Set<number>>(new Set());
  const [inCoolingPeriod, setInCoolingPeriod] = useState(false);

  const cards = useMemo(() => {
    return getRandomizedCards();
  }, []);

  const gameIsWon = matchingCards.size === cards.length;

  const onFlip = (index: number) => {
    if (flippedCards.length === 0 || flippedCards.length === 2) {
      setFlippedCards([index]);
      return;
    }

    setFlippedCards((prev) => [...prev, index]);

    const cardsAreMatching = cards[flippedCards[0]] === cards[index];
    if (cardsAreMatching) {
      const newMatchingCards = new Set([
        ...matchingCards,
        flippedCards[0],
        index,
      ]);

      if (newMatchingCards.size !== cards.length) {
        setTurn((prev) => prev + 1);
      }

      setMatchingCards(newMatchingCards);
    } else {
      setInCoolingPeriod(true);
      setTurn((prev) => prev + 1);
      setTimeout(() => {
        setInCoolingPeriod(false);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div>
      {!gameIsWon ? (
        <>
          <p>Turn #{turn}</p>
          {inCoolingPeriod && <p>Not a match...</p>}
        </>
      ) : (
        <p>You won the game in {turn} turns!</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 50px)" }}>
        {cards.map((card, index) => {
          const isInMatchingCards = matchingCards.has(index);
          const isFlipped = flippedCards.includes(index) || isInMatchingCards;

          return (
            <button
              key={`${card}:${index}`}
              style={{
                height: "50px",
                width: "50px",
                borderRadius: "3px",
                backgroundColor: !isFlipped ? "#ccc" : undefined,
                border: "1px solid black",
              }}
              onClick={() => onFlip(index)}
              disabled={isFlipped || inCoolingPeriod}
            >
              {isFlipped ? card : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
};
