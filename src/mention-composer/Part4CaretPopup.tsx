/**
 * @Mention Composer (Part 4 of 4): Popup at the Caret
 *
 * Start from your Part 3 code. Position the popup at the caret.
 *
 * Requirements:
 * 1. The popup appears directly under the "@" being typed, not under the
 *    textarea. Research the "mirror div" technique for measuring caret
 *    coordinates in a textarea.
 * 2. It must stay correct when the text wraps onto multiple lines and when
 *    the textarea is scrolled.
 * 3. If there isn't room below (near the bottom of the viewport), open it
 *    above the caret instead.
 *
 * Stretch: highlight mentions inside the textarea using an overlay behind a
 * transparent textarea.
 *
 * Discussion: would contenteditable make this easier or harder overall?
 *
 * Time target: 35 minutes.
 */

import styles from "./MentionComposer.module.css";
import { fetchRecentMentions, fetchUsers, sendMessage } from "./mockApi";

export const Part4CaretPopup = () => {
  // TODO: implement
  void [fetchUsers, fetchRecentMentions, sendMessage];

  return (
    <div>
      <h2>@Mention Composer: Part 4</h2>
    </div>
  );
};
