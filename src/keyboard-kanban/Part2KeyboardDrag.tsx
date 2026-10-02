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
import { type Card, type Column, fetchBoard } from "./mockApi";

type ColumnMap = Record<Column["id"], Column>;
type CardMap = Record<Card["id"], Card>;
type CardRefs = Record<Card["id"], HTMLDivElement>;

export const Part2KeyboardDrag = () => {
  const cardRefs = useRef<CardRefs>({});

  const [columns, setColumns] = useState<ColumnMap>({});
  const [cards, setCards] = useState<CardMap>({});

  const columnsArray = Object.values(columns);

  useEffect(() => {
    fetchBoard().then((res) => {
      setCards(
        res.cards.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as CardMap),
      );

      setColumns(
        res.columns.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as ColumnMap),
      );
    });
  }, []);

  const getColumn = (cardId: Card["id"]) => {
    for (
      let columnIndex = 0;
      columnIndex < columnsArray.length;
      columnIndex++
    ) {
      const column = columnsArray[columnIndex];
      if (column.cardIds.includes(cardId)) {
        return { column, columnIndex };
      }
    }
  };

  const onColumnKeyDown = (e: KeyboardEvent) => {
    let cardId;

    for (const [id, el] of Object.entries(cardRefs.current)) {
      if (el === e.target) {
        cardId = id;
      }
    }

    if (!cardId) return;

    const { column, columnIndex } = getColumn(cardId)!;
    const cardsInColumn = column.cardIds;
    const focusedCardIndex = cardsInColumn.indexOf(cardId);

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();

      const boundary = e.key === "ArrowDown" ? cardsInColumn.length - 1 : 0;
      const offset = e.key === "ArrowDown" ? 1 : -1;

      if (focusedCardIndex !== boundary) {
        const nextFocusedCardId = cardsInColumn[focusedCardIndex + offset];
        const nextFocusedDiv = cardRefs.current[nextFocusedCardId];
        nextFocusedDiv.focus();
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();

      const boundary = e.key === "ArrowLeft" ? -1 : columnsArray.length;
      const offset = e.key === "ArrowLeft" ? -1 : 1;
      let nextColumnIndex = columnIndex + offset;

      while (nextColumnIndex !== boundary) {
        const nextColumnCards = columnsArray[nextColumnIndex].cardIds;

        if (nextColumnCards.length === 0) {
          nextColumnIndex += offset;
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
        style={{ "--grid-count": columnsArray.length } as CSSProperties}
        onKeyDown={(e) => {
          onColumnKeyDown(e);
        }}
      >
        {columnsArray.map((column) => {
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
