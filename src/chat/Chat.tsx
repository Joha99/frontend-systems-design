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

import { useEffect, useRef, useState } from "react";

import styles from "./Chat.module.css";

interface User {
  id: number;
  username: string;
  fullName: string;
}

interface Comment {
  body: string;
  id: number;
  likes: number;
  postId: number;
  user: User;
  timeStamp: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [sendStatus, setSendStatus] = useState<
    "loading" | "success" | "error"
  >();

  const scrollEl = useRef<HTMLDivElement>(null);
  const messagesCount = useRef(0);

  useEffect(() => {
    fetch("https://dummyjson.com/comments?limit=20")
      .then((response) => response.json())
      .then((json) => {
        const currTime = new Date().toLocaleTimeString();
        const comments: Comment[] = json.comments.map(
          (comment: Comment) => ({ ...comment, timeStamp: currTime }),
        );
        setMessages(comments);
        messagesCount.current = json.comments.length;
      });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch(
        `https://dummyjson.com/comments?limit=5&skip=${messagesCount.current}`,
      )
        .then((response) => response.json())
        .then((json) => {
          const currTime = new Date().toLocaleTimeString();
          const comments: Comment[] = json.comments.map(
            (comment: Comment) => ({ ...comment, timeStamp: currTime }),
          );
          setMessages((prev) => [...prev, ...comments]);
          messagesCount.current += json.comments.length;
        });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (scrollEl.current) {
      scrollEl.current.scrollTo(0, scrollEl.current.scrollHeight);
    }
  }, [messages]);

  const handleSendMessage = () => {
    setSendStatus("loading");
    fetch("https://dummyjson.com/comments/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: input, postId: 1, userId: 1 }),
    })
      .then((response) => response.json())
      .then((newMessage) => {
        const currTime = new Date().toLocaleTimeString();
        setMessages((prev) => [
          ...prev,
          { ...newMessage, timeStamp: currTime },
        ]);
        setInput("");
        setSendStatus("success");
      })
      .catch(() => {
        setSendStatus("error");
      });
  };

  return (
    <div>
      <h2>Real-Time Chat</h2>
      <div className={styles.chatContainer}>
        <div className={styles.scrollableContainer} ref={scrollEl}>
          {messages.map((message) => (
            <div className={styles.message} key={message.id}>
              <div>
                <h4 className={styles.userName}>{message.user.fullName}</h4>
                <span>{message.timeStamp}</span>
              </div>
              <div>{message.body}</div>
            </div>
          ))}
          {sendStatus === "loading" && <p>Typing...</p>}
        </div>
        <div className={styles.chatControls}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Enter a message to send"
          />
          <button
            onClick={handleSendMessage}
            disabled={sendStatus === "loading"}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
