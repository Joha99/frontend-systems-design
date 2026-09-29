/**
 * @Mention Composer (Part 2 of 4): @ Trigger + Keyboard Combobox
 *
 * Start from your Part 1 search. Move it into a textarea triggered by "@".
 *
 * Requirements:
 * 1. A <textarea>. Typing "@" at the start or after whitespace opens the
 *    suggestion popup. The text from "@" to the caret is the query.
 * 2. The popup can sit under the textarea for now (Part 4 positions it
 *    at the caret).
 * 3. Keyboard while open (the textarea keeps focus):
 *    - ArrowDown / ArrowUp moves the active option (wraps around).
 *    - Enter or Tab inserts "@handle " in place of "@query" and closes.
 *    - Escape closes. It must not reopen until a NEW "@" is typed.
 *    - Typing a space right after "@", or deleting the "@", closes it.
 *    Clicking an option also inserts it.
 * 4. Accessibility: the textarea is an ARIA combobox (aria-expanded,
 *    aria-controls, aria-activedescendant); the popup is a listbox with
 *    options.
 * 5. After inserting, the caret goes right after the inserted "@handle ".
 *
 * Done when: you can write "hey @ma", arrow to a user, press Enter, and
 * keep typing without touching the mouse.
 *
 * Time target: 45 minutes.
 */

import styles from "./MentionComposer.module.css";
import { fetchRecentMentions, fetchUsers } from "./mockApi";

export const Part2Combobox = () => {
  // TODO: implement
  void [fetchUsers, fetchRecentMentions];

  return <div>@Mention Composer: Part 2</div>;
};
