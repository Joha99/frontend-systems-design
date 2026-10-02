/**
 * Keyboard-Accessible Kanban (Part 1 of 4): Board + Focus Navigation
 *
 * Load the board and make every card reachable from the keyboard.
 *
 * API: fetchBoard() → { columns, cards }  (see ./mockApi.ts)
 *
 * Requirements:
 * 1. Load the board on mount (loading + error states). Render columns
 *    left to right, cards top to bottom.
 * 2. Store it NORMALIZED: cards by id, each column holding an ordered array
 *    of card ids.
 * 3. Every card is focusable. Tab/Shift+Tab moves between cards in DOM order.
 * 4. ArrowUp/ArrowDown moves focus within a column (stop at the ends).
 *    ArrowLeft/ArrowRight moves focus to the adjacent column, to the card at
 *    the same index, clamped to that column's length. Skip empty columns.
 *
 * 5. Use ONE keydown handler on the board, not one per card.
 *
 * Done when: you can reach every card with only the arrow keys and
 * nothing breaks at the edges or on an empty column.
 *
 * Time target: 35 minutes.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import styles from "./KeyboardKanban.module.css";
import { type Board, type Card, type Column, fetchBoard } from "./mockApi";

export const Part1Board = () => {
  const [columns, setColumns] = useState<Record<Column["id"], Column>>({});
  const [cards, setCards] = useState<Record<Card["id"], Card>>({});

  const cardRefs = useRef<Record<Card["id"], HTMLDivElement>>({});

  useEffect(() => {
    fetchBoard().then((res) => {
      console.log("fetch result", res);

      const cardMap: Record<Card["id"], Card> = {};
      res.cards.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, cardMap);
      setCards(cardMap);

      const columnMap: Record<Column["id"], Column> = {};
      res.columns.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, columnMap);
      setColumns(columnMap);
    });
  }, []);

  const getColumn = (
    cardId: Card["id"],
  ): { column: Column; columnIndex: number } => {
    let columnWithCard;
    let columnIndex;

    for (let i = 0; i < Object.values(columns).length; i++) {
      const column = Object.values(columns)[i];
      if (column.cardIds.includes(cardId)) {
        columnWithCard = column;
        columnIndex = i;
        break;
      }
    }

    return { column: columnWithCard!, columnIndex: columnIndex! };
  };

  const onColumnKeyDown = (e: KeyboardEvent) => {
    let cardId;

    for (const [id, el] of Object.entries(cardRefs.current)) {
      if (el === e.target) {
        cardId = id;
      }
    }

    if (!cardId) return;

    const { column, columnIndex } = getColumn(cardId);

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();

      const cardsInColumn = column.cardIds;
      const focusedCardIndex = cardsInColumn.indexOf(cardId);
      const boundary = e.key === "ArrowDown" ? cardsInColumn.length - 1 : 0;
      const offset = e.key === "ArrowDown" ? 1 : -1;

      if (focusedCardIndex !== boundary) {
        const nextFocusedCardId = cardsInColumn[focusedCardIndex + offset];
        const nextFocusedDiv = cardRefs.current[nextFocusedCardId];
        nextFocusedDiv.focus();
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();

      const columnArray = Object.values(columns);
      const boundary = e.key === "ArrowLeft" ? -1 : columnArray.length;
      const offset = e.key === "ArrowLeft" ? -1 : 1;
      const focusedCardIndex = column.cardIds.indexOf(cardId);
      let start = columnIndex + offset;

      while (start !== boundary) {
        const nextColumnCards = columnArray[start].cardIds;

        if (nextColumnCards.length === 0) {
          start += offset;
          continue;
        }

        const nextFocusedCardIndex = Math.min(
          nextColumnCards.length - 1,
          focusedCardIndex,
        );

        const nextFocusedCardId = nextColumnCards[nextFocusedCardIndex];
        const nextFocusedDiv = cardRefs.current[nextFocusedCardId];
        nextFocusedDiv.focus();
        return;
      }
    }
  };

  return (
    <div>
      <h2>Keyboard-Accessible Kanban: Part 1</h2>
      <div
        className={styles.grid}
        style={
          { "--grid-count": Object.values(columns).length } as CSSProperties
        }
        onKeyDown={(e) => {
          onColumnKeyDown(e);
        }}
      >
        {Object.values(columns).map((column) => {
          return (
            <div className={styles.column} key={column.id}>
              <h4 className={styles["column-header"]}>{column.title}</h4>
              {column.cardIds.map((cardId) => {
                const card = cards[cardId];

                return (
                  <div
                    className={styles.card}
                    key={cardId}
                    tabIndex={0}
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[cardId] = el;
                      }
                      return () => {
                        delete cardRefs.current[cardId];
                      };
                    }}
                  >
                    <h5>
                      [{card.id}] {card.title}
                    </h5>
                    <p>{card.label}</p>
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
