/**
 * Nested Comments (Recursion)
 *
 * Build a comment thread where each comment can have replies, nested arbitrarily deep.
 *
 * Requirements:
 * 1. Render a list of comments from the provided data.
 * 2. Each comment shows: author, text, and a "Reply" button.
 * 3. Clicking "Reply" shows an inline input + submit button below that comment.
 * 4. Submitting a reply adds it as a nested child of that comment.
 * 5. Replies are indented to show nesting depth.
 * 6. Use a recursive component to render the tree.
 *
 * Time target: 15 minutes.
 */

import { useState } from "react";

import styles from "./NestedComments.module.css";

interface CommentData {
  id: number;
  author: string;
  text: string;
  replies: CommentData[];
}

const COMMENTS: CommentData[] = [
  {
    id: 1,
    author: "Alice",
    text: "Great post!",
    replies: [
      { id: 2, author: "Bob", text: "Thanks!", replies: [] },
      {
        id: 3,
        author: "Charlie",
        text: "Agreed",
        replies: [{ id: 4, author: "Alice", text: "Right?", replies: [] }],
      },
    ],
  },
  { id: 5, author: "Diana", text: "Interesting perspective", replies: [] },
];

let nextId = 6;

const addReplyToTree = (
  tree: CommentData[],
  parentId: number,
  text: string,
): CommentData[] => {
  return tree.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        replies: [
          ...item.replies,
          { id: nextId++, author: "Joha", text, replies: [] },
        ],
      };
    }
    return { ...item, replies: addReplyToTree(item.replies, parentId, text) };
  });
};

const Comment = ({
  comment,
  addReply,
}: {
  comment: CommentData;
  addReply: (parentId: number, text: string) => void;
}) => {
  return (
    <li className={styles.collection}>
      <div className={styles.title}>
        {comment.author}: {comment.text}{" "}
        <button
          className={styles.reply}
          onClick={() => addReply(comment.id, "Hello")}
        >
          Reply
        </button>
      </div>
      {comment.replies.length > 0 && (
        <ul className={styles.collection}>
          {comment.replies.map((child) => (
            <Comment key={child.id} comment={child} addReply={addReply} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const NestedComments = () => {
  const [commentsList, setCommentsList] = useState<CommentData[]>(COMMENTS);

  const addReply = (parentId: number, text: string) => {
    setCommentsList((prev) => addReplyToTree(prev, parentId, text));
  };

  return (
    <div>
      <h2>Nested Comments</h2>
      <ul className={styles.container}>
        {commentsList.map((comment) => (
          <Comment key={comment.id} comment={comment} addReply={addReply} />
        ))}
      </ul>
    </div>
  );
};
