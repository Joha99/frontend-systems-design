/**
 * Real-Time Chat Interface
 *
 * Build a chat UI that simulates real-time messaging via polling.
 * API:
 * - GET  https://dummyjson.com/comments?limit=20         → initial messages
 * - POST https://dummyjson.com/comments/add               → body: { body, postId, userId }
 * - GET  https://dummyjson.com/comments?limit=5&skip={n}  → poll for new messages
 *
 * Requirements:
 * 1. On mount, fetch and display the initial messages in a scrollable container.
 * 2. Auto-scroll to the bottom on initial load and when new messages arrive.
 * 3. Show a text input and Send button. On send, POST the message and add it to the list.
 * 4. Poll for new messages every 3 seconds using setInterval inside a useEffect.
 * 5. Show a "typing..." indicator while a message is being sent.
 * 6. Show timestamps on each message (use the current time for sent messages).
 *
 * Stretch:
 * - Optimistic send — show the message immediately, mark as "sending", update on success.
 * - Unread count — if the user scrolls up, show a badge with the number of new messages below.
 * - Infinite scroll upward to load older message history.
 * - "User is typing" indicator when the input has focus and text.
 */

import styles from "./Chat.module.css";

export const Chat = () => {
  return (
    <div>
      <p>9. Build a real-time chat interface with polling.</p>
    </div>
  );
};
