/**
 * Keyboard-Accessible Kanban (Part 2 of 4): Keyboard Drag and Drop
 *
 * Start from your Part 1 code. Add moving cards with the keyboard.
 * Changes are LOCAL ONLY in this part (no server calls).
 *
 * Requirements:
 * 1. Write one local operation, moveCard(cardId, toColumnId, toIndex), and
 *    use it for every kind of move.
 * 2. Space on a focused card PICKS IT UP (visually lifted).
 *    While lifted:
 *    - ArrowUp/Down moves it within its column.
 *    - ArrowLeft/Right moves it to the adjacent column at the closest index.
 *    - Space DROPS it. Escape CANCELS and returns it to where it was picked
 *      up (same column and index).
 *    Focus stays on the moving card the whole time.
 * 3. WIP limits: a column with a `limit` that is full can't be entered. The
 *    card stays put.
 * 4. Announce each step in an aria-live region, e.g.
 *    "Picked up Fix login bug. Position 2 of 4 in To Do."
 *    "Moved to In Progress, position 1 of 3." / "In Progress is full."
 *    "Dropped." / "Move cancelled. Returned to To Do, position 2."
 *
 * Done when: a screen reader user could move a card to any valid spot and
 * know where it is at every step.
 *
 * Time target: 45 minutes.
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

export const Part2KeyboardDrag = () => {
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
      <h2>Keyboard-Accessible Kanban: Part 2</h2>
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
