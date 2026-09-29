/**
 * @Mention Composer (Part 1 of 4): Trie + Ranked Suggestions
 *
 * Build the search engine behind the suggestions, with a simple UI.
 *
 * API: fetchUsers() → 500 users (slow, ~1s)
 *      fetchRecentMentions() → user ids, most recent first
 *
 * Requirements:
 * 1. Load users on mount and build a TRIE once. Index each user under their
 *    first name, last name, AND handle (case-insensitive), so "jo", "smi"
 *    and "john.s" all find John Smith.
 * 2. A plain <input> for the query and a list below it showing up to 8
 *    UNIQUE matching users ("First Last  @handle").
 * 3. Ranking: recently mentioned users first (in recency order), then
 *    alphabetical by handle.
 * 4. Stop collecting once you have enough results; don't gather every match
 *    and then slice.
 * 5. Show "Loading users…" until the trie is ready.
 *
 * Done when: typing "ma" instantly shows Maria/Mario/Mark/Marcus and
 * Martin/Martinez users, with recent ones on top.
 *
 * Discussion: trie vs. sorted array + binary search. What if there were
 * 2M users on a server?
 *
 * Time target: 35 minutes.
 */

import styles from "./MentionComposer.module.css";
import { fetchRecentMentions, fetchUsers } from "./mockApi";

export const Part1TrieSearch = () => {
  // TODO: implement
  void [fetchUsers, fetchRecentMentions];

  return <div>@Mention Composer: Part 1</div>;
};
