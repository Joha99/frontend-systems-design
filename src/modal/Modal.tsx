/**
 * Accessible Modal System
 *
 * Build a reusable modal component with proper accessibility and a compound component API.
 *
 * Requirements:
 * 1. Create a compound component API: <Modal>, <Modal.Trigger>, <Modal.Content>, <Modal.Close>.
 * 2. Modal.Trigger opens the modal. Modal.Close and pressing Escape close it.
 * 3. Render Modal.Content in a React portal (appended to document.body).
 * 4. Trap focus inside the modal while open -- Tab cycles through focusable elements,
 *    not the page behind. Shift+Tab cycles backwards.
 * 5. Lock body scroll while the modal is open.
 * 6. Show a backdrop overlay. Clicking the backdrop closes the modal.
 * 7. On close, return focus to the element that triggered the modal.
 * 8. The modal content is a paginated list of items (fetched from
 *    https://dummyjson.com/products?limit=10&skip=0). Show 5 items per page inside the
 *    modal with Prev/Next controls. Display "Showing X-Y of Z" with correct math.
 *    Fetch the next batch when navigating past your current data (offset pagination).
 *
 * Accessibility:
 * - Modal container has role="dialog" and aria-modal="true".
 * - Modal has an aria-labelledby pointing to a heading inside it.
 * - Focus moves to the first focusable element inside the modal on open.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";

import "./Modal.css";

interface ModalContextState {
  onOpen: () => void;
  onClose: () => void;
  open: boolean;
}

const ModalContext = createContext<ModalContextState>({
  onOpen: () => {},
  onClose: () => {},
  open: false,
});

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const ModalTrigger = () => {
  const { onOpen, open } = useContext(ModalContext);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [open]);

  return (
    <button onClick={onOpen} ref={buttonRef}>
      Open the modal
    </button>
  );
};

const ModalClose = () => {
  const { onClose } = useContext(ModalContext);

  return (
    <button aria-label="Close" className="modal-close" onClick={onClose}>
      🅧
    </button>
  );
};

const ModalContent = ({ children }: PropsWithChildren) => {
  const { open, onClose } = useContext(ModalContext);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const focusableElements =
      modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (e.key === "Tab" && !e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    firstFocusable.focus();
    modalRef.current.addEventListener("keydown", handleKeyDown);

    return () => {
      modalRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="overlay"
      role="dialog"
      aria-labelledby="header"
      aria-modal={true}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-root" ref={modalRef}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

const ModalRoot = ({
  children,
  defaultOpen = false,
}: PropsWithChildren<{ defaultOpen?: boolean }>) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const onOpen = useCallback(() => setInternalOpen(true), []);
  const onClose = useCallback(() => setInternalOpen(false), []);

  const contextValue = useMemo(
    () => ({ onOpen, onClose, open: internalOpen }),
    [onOpen, onClose, internalOpen],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Close: ModalClose,
};
