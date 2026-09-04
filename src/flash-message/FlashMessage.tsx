/**
 * Flash Message with useLayoutEffect
 *
 * Build a notification system that measures DOM elements before paint
 * to position toast messages without visual flicker.
 *
 * Requirements:
 * 1. A button that adds a toast notification to a stack in the top-right corner.
 * 2. Each toast has a message, a type (success/error/info), and auto-dismisses after 3 seconds.
 * 3. Use useLayoutEffect to measure each new toast's height immediately after it mounts
 *    and set its vertical offset based on the toasts above it (so they stack without overlap).
 * 4. Without useLayoutEffect, toasts would briefly flash at position 0 then jump to their
 *    correct position. useLayoutEffect prevents this flicker.
 * 5. Each toast has a manual "X" close button.
 * 6. When a toast in the middle is dismissed, the ones below it slide up.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "./FlashMessage.css";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

type ToastMap = Record<Toast["id"], Toast>;

type ToastStylesMap = Record<Toast["id"], number>;

const TOAST_GAP = 10;

const toastColorMap: Record<Toast["type"], CSSProperties["backgroundColor"]> = {
  success: "rgb(196, 251, 200)",
  error: "rgb(255, 207, 207)",
  info: "rgb(189, 245, 254)",
};

export const FlashMessage = () => {
  const [toasts, setToasts] = useState<ToastMap>({});
  const [toastStyles, setToastStyles] = useState<ToastStylesMap>({});

  const toastRefs = useRef<Record<Toast["id"], HTMLDivElement>>({});
  const nextTopOffset = useRef<number>(TOAST_GAP);

  const nextId = useRef<number>(1);

  useLayoutEffect(() => {
    const newToastStylesMap: ToastStylesMap = {};

    Object.keys(toasts).forEach((id) => {
      const el = toastRefs.current[parseInt(id)];
      const { height } = el.getBoundingClientRect();
      newToastStylesMap[parseInt(id)] = nextTopOffset.current;
      nextTopOffset.current += height + TOAST_GAP;
    });

    setToastStyles(newToastStylesMap);
    nextTopOffset.current = TOAST_GAP;
  }, [toasts]);

  const addToast = (type: Toast["type"]) => {
    const newToast: Toast = {
      id: nextId.current,
      message: `New ${type} toast`,
      type: type,
    };

    setToasts((prev) => ({
      ...prev,
      [newToast.id]: {
        id: newToast.id,
        message: `New ${type} toast`,
        type: type,
      },
    }));

    nextId.current = nextId.current + 1;
  };

  const removeToast = (id: Toast["id"]) => {
    setToasts((prev) => {
      const { [id]: removedToast, ...rest } = prev;
      return rest;
    });
  };

  const toastsArray = Object.values(toasts);

  return (
    <div>
      <div className="toastButtons">
        <button onClick={() => addToast("success")}>SUCCESS</button>
        <button onClick={() => addToast("error")}>ERROR</button>
        <button onClick={() => addToast("info")}>INFO</button>
      </div>
      {toastsArray.map(({ id, message, type }) => {
        return (
          <div
            key={id}
            className="toastWrapper"
            style={
              {
                "--bg-color": toastColorMap[type],
                "--top-offset": `${toastStyles[id]}px`,
              } as CSSProperties
            }
            ref={(el) => {
              if (el) {
                toastRefs.current[id] = el;
              }
            }}
          >
            <div className="toast">
              <p className="toastMessage">
                <span>{`[ID: ${id}]`}</span>
                <span>{message}</span>
              </p>
              <button className="closeButton" onClick={() => removeToast(id)}>
                Ⓧ
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
