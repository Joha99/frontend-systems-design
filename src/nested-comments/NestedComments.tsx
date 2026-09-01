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
 * Starting data:
 * const COMMENTS = [
 *   { id: 1, author: "Alice", text: "Great post!", replies: [
 *     { id: 2, author: "Bob", text: "Thanks!", replies: [] },
 *     { id: 3, author: "Charlie", text: "Agreed", replies: [
 *       { id: 4, author: "Alice", text: "Right?", replies: [] },
 *     ]},
 *   ]},
 *   { id: 5, author: "Diana", text: "Interesting perspective", replies: [] },
 * ];
 *
 * Time target: 15 minutes.
 */

import styles from "./NestedComments.module.css";

export const NestedComments = () => {
  return <div>Nested Comments</div>;
};
