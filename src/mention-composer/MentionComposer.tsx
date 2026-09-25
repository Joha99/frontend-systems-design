/**
 * @Mention Composer (Slack / GitHub style)
 *
 * Build a message composer that suggests people when the user types "@",
 * inserts mentions, and sends structured messages.
 *
 * API (see ./mockApi.ts; all calls have latency):
 *   fetchUsers()                → all 500 users (slow, ~1s)
 *   fetchRecentMentions()       → user ids, most recent first
 *   sendMessage(text, mentions) → Message
 *     Rejects ~10% of the time, and with "INVALID_MENTION" if any mention
 *     range doesn't contain exactly "@" + that user's handle.
 *
 * Requirements:
 * 1. A <textarea>. When the user types "@" at the start of the text or
 *    after whitespace, open a suggestion popup. The text after "@" up to
 *    the caret is the query. If users are still loading, show "Loading…"
 *    in the popup.
 * 2. Build a TRIE once from fetchUsers(). Index each user under their
 *    first name, last name, and handle, so "@jo", "@smi" and "@john.s" all
 *    match. Look up the query prefix in the trie; do NOT filter the full
 *    array on each keystroke. Return at most 8 unique users, recently
 *    mentioned users first (seeded from fetchRecentMentions, updated as
 *    the user sends mentions), then alphabetical.
 * 3. Position the popup under the caret, not under the textarea.
 *    (Hint: research the "mirror div" technique for measuring caret
 *    coordinates in a textarea.)
 * 4. Keyboard while the popup is open (the textarea keeps focus):
 *    - ArrowDown / ArrowUp: move the active option (wraps around).
 *    - Enter or Tab: insert the active user as "@handle " and close.
 *    - Escape: close. It must not reopen until a NEW "@" is typed.
 *    - Typing keeps filtering; a space right after "@" or deleting the "@"
 *      closes the popup.
 *    Clicking an option also inserts it.
 * 5. Mentions are ATOMIC: track each inserted mention's { userId, start,
 *    end } range. Backspace at the end of a mention deletes the whole
 *    mention. Editing text BEFORE a mention must shift its range; editing
 *    INSIDE it (e.g. selecting it and typing) turns it back into plain text.
 * 6. Cmd/Ctrl+Enter (or a Send button) calls sendMessage. Disable sending
 *    while in flight. On success, clear the composer and append the message
 *    to a list above, rendering mentions as highlighted chips. On failure,
 *    keep the draft (text AND mentions) and show the error.
 * 7. Accessibility: the textarea is an ARIA combobox (aria-expanded,
 *    aria-controls, aria-activedescendant); the popup is a listbox.
 *
 * Stretch:
 * - Highlight mentions inside the textarea (overlay technique).
 * - Paste of text containing "@handle" resolves known handles to mentions.
 *
 * Data structure focus:
 * - Trie insert + prefix search that collects results with early exit.
 * - Recency ranking (a small most-recently-used list).
 * - Keeping ranges consistent under text edits (offset shifting).
 *
 * Discussion questions:
 * - Trie vs. sorted array + binary search for prefix lookup: tradeoffs?
 * - The user list is 2M people on a server. What changes?
 * - Why is a textarea harder or easier than contenteditable here?
 *
 * Time target: 90 minutes.
 */

import styles from "./MentionComposer.module.css";
import { fetchRecentMentions, fetchUsers, sendMessage } from "./mockApi";

export const MentionComposer = () => {
  // TODO: implement
  void [fetchUsers, fetchRecentMentions, sendMessage];

  return <div>Mention Composer</div>;
};
