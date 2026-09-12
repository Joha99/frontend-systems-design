/**
 * Trie Autocomplete
 *
 * Build an autocomplete input powered by a Trie data structure.
 *
 * Requirements:
 * 1. Implement a Trie class with:
 *    - insert(word): add a word to the trie, character by character.
 *    - search(prefix): return all words that start with the prefix.
 *      Traverse to the prefix node, then DFS to collect all complete words.
 *    - Each node: { children: Record<string, TrieNode>, isEnd: boolean }
 * 2. On mount, insert a list of 200+ words into the trie.
 *    Use: https://random-word-api.herokuapp.com/word?number=200
 *    or hardcode a word list.
 * 3. Render a text input. As the user types, call trie.search(input)
 *    and display matching words in a dropdown (max 10 shown).
 * 4. Show the number of matches: "X words found".
 * 5. Click a suggestion to fill the input. Arrow Up/Down to navigate,
 *    Enter to select.
 * 6. Compare performance: add a "Linear filter" toggle that uses
 *    Array.filter instead of the trie. Show the time taken for each
 *    search (performance.now()) to demonstrate the trie's advantage.
 *
 * Algorithm focus:
 * - Trie insertion: for each character in a word, create a child node
 *   if it doesn't exist, then traverse into it. Mark the last node isEnd.
 * - Trie prefix search: traverse the trie following the prefix characters.
 *   If any character is missing, return []. If the prefix exists, DFS from
 *   that node collecting all paths where isEnd is true.
 * - DFS collection: recursive function that builds the word character by
 *   character, adds to results when isEnd is true.
 * - Time complexity: insert O(L), search O(P + N) where P = prefix length,
 *   N = number of matching words. Linear filter is O(W * L) every time.
 *
 * Time target: 25 minutes.
 */

import styles from "./TrieAutocomplete.module.css";

export const TrieAutocomplete = () => {
  // TODO: implement

  return <div>Trie Autocomplete</div>;
};
