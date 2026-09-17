/**
 * Card Deck Simulator (Tesla-style)
 *
 * Build a visual card game using a double-ended queue.
 * "Design a card game with deque."
 *
 * Requirements:
 * 1. Initialize a standard 52-card deck (4 suits x 13 ranks).
 * 2. "Shuffle" button shuffles the deck.
 * 3. "Draw from Top" removes and shows the top card.
 * 4. "Draw from Bottom" removes and shows the bottom card.
 * 5. "Return to Top" / "Return to Bottom" puts the last drawn
 *    card back on the chosen end.
 * 6. Display: deck size, drawn pile, current top/bottom peek.
 * 7. Disable draw buttons when deck is empty.
 *
 * Bonus:
 * - "Deal" button: deal 5 cards to 2 players alternately.
 * - Show a simple hand evaluation (pair, two pair, etc.).
 *
 * Time target: 20 minutes (base), 30 minutes (with bonus).
 */

import { useState } from "react";
import styles from "./CardDeck.module.css";

const SUITS = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"] as const;
const RANKS = [
  "ACE",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "JACK",
  "QUEEN",
  "KING",
] as const;

type Suit = (typeof SUITS)[number];
type Rank = (typeof RANKS)[number];
type Card = [Suit, Rank];
type Deck = Card[];

const shuffleArray = (array: Deck): Deck => {
  const shuffed: Deck = [...array];
  for (let i = shuffed.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (1 + i));
    [shuffed[i], shuffed[swapIndex]] = [shuffed[swapIndex], shuffed[i]];
  }
  return shuffed;
};

const getCards = () => {
  const deck: Deck = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push([suit, rank]);
    });
  });
  return shuffleArray(deck);
};

export const CardDeck = () => {
  const [cards, setCards] = useState<Deck>(getCards);
  const [drawn, setDrawn] = useState<Deck>([]);

  const isDeckEmpty = cards.length === 0;
  const isDrawnEmpty = drawn.length === 0;

  const onDraw = (location: "top" | "bottom") => {
    let drawnCard: Card;

    if (location === "top") {
      drawnCard = cards[0];
      setCards((prev) => [...prev.slice(1)]);
    } else {
      drawnCard = cards[cards.length - 1];
      setCards((prev) => [...prev.slice(0, prev.length - 1)]);
    }

    setDrawn((prev) => [[drawnCard[0], drawnCard[1]], ...prev]);
  };

  const onReturn = (location: "top" | "bottom") => {
    if (drawn.length === 0) {
      return;
    }

    const drawnCard: Card = drawn[0];

    if (location === "top") {
      setCards((prev) => [[drawnCard[0], drawnCard[1]], ...prev]);
    } else {
      setCards((prev) => [...prev, [drawnCard[0], drawnCard[1]]]);
    }

    setDrawn((prev) => [...prev.slice(1)]);
  };

  const onShuffle = () => {
    setCards((prev) => shuffleArray(prev));
  };

  const reversedDeck = cards.toReversed();

  return (
    <div className={styles.wrapper}>
      <h2>Card Deck Simulator</h2>
      <p>Pile count: {cards.length}</p>
      <p>Drawn count: {drawn.length}</p>
      <div>
        <button onClick={onShuffle} disabled={isDeckEmpty}>
          Shuffle
        </button>
        <button onClick={() => onDraw("top")} disabled={isDeckEmpty}>
          Draw from top
        </button>
        <button onClick={() => onDraw("bottom")} disabled={isDeckEmpty}>
          Draw from bottom
        </button>
        <button onClick={() => onReturn("top")} disabled={isDrawnEmpty}>
          Return to top
        </button>
        <button onClick={() => onReturn("bottom")} disabled={isDrawnEmpty}>
          Return to bottom
        </button>
      </div>
      <div className={styles.table}>
        {!isDrawnEmpty && (
          <div className={styles.drawn}>
            <h2>{drawn[0][0]}</h2>
            <h3>{drawn[0][1]}</h3>
          </div>
        )}
        <div className={styles.deckArea}>
          {reversedDeck.map(([suit, rank], index) => {
            const isOnTop = index === cards.length - 1;
            const isOnBottom = index === 0;

            return (
              <div
                key={`${suit}${rank}`}
                className={`${styles.card} ${isOnTop ? styles.top : ""} ${isOnBottom ? styles.bottom : ""}`}
              >
                <h2>{suit}</h2>
                <h3>{rank}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
