/**
 * @Mention Composer (Part 3 of 4): Atomic Mentions + Send
 *
 * Start from your Part 2 code. Track mentions as data and send messages.
 *
 * API: sendMessage(text, mentions) → Message
 *      Rejects ~10% of the time, and with "INVALID_MENTION" if any range
 *      doesn't contain exactly "@" + that user's handle.
 *
 * Requirements:
 * 1. Track each inserted mention as { userId, start, end } in the text.
 * 2. Editing text BEFORE a mention shifts its range. Editing INSIDE it
 *    (typing into it, or selecting it and typing) turns it back into plain
 *    text (drop the mention).
 * 3. Backspace right after a mention deletes the WHOLE mention.
 * 4. Cmd/Ctrl+Enter or a Send button calls sendMessage. Disable sending
 *    while in flight. On success, clear the composer, add the message to a
 *    list above with mentions shown as highlighted chips, and move those
 *    users to the front of the "recent" ranking.
 * 5. On failure, keep the draft (text AND mentions) and show the error.
 *    An INVALID_MENTION error means your range tracking has a bug.
 *
 * Done when: you can add 3 mentions, edit text between and before them,
 * delete one with Backspace, and the send succeeds.
 *
 * Time target: 45 minutes.
 */

import styles from "./MentionComposer.module.css";
import { fetchRecentMentions, fetchUsers, sendMessage } from "./mockApi";

export const Part3AtomicMentions = () => {
  // TODO: implement
  void [fetchUsers, fetchRecentMentions, sendMessage];

  return <div>@Mention Composer: Part 3</div>;
};
