/**
 * LRU Cache Visualizer
 *
 * Implement an LRU (Least Recently Used) cache from scratch and build
 * a visual interface to interact with it.
 *
 * Requirements:
 * 1. Implement an LRUCache class with:
 *    - constructor(capacity): set max size.
 *    - get(key): return value if key exists (and mark as recently used),
 *      or -1 if not found.
 *    - put(key, value): insert or update. If at capacity, evict the
 *      least recently used entry before inserting.
 *    All operations must be O(1).
 * 2. Data structure: Map (preserves insertion order) or doubly linked
 *    list + hash map.
 *    - Map approach: delete and re-insert on access to move to end.
 *      Map.keys().next().value gives the LRU (first inserted).
 *    - Linked list approach: move accessed node to tail. Evict from head.
 * 3. Render the cache visually: show each entry as a card in order
 *    from LRU (left) to MRU (right). Highlight the most recently
 *    accessed item. Show capacity (e.g. "3/5 used").
 * 4. Input fields: "key" and "value" inputs with "Put" button.
 *    "Key" input with "Get" button. Show the result of each operation.
 * 5. Operation log: show a scrollable list of operations performed
 *    and their results ("GET 3 → 42", "PUT 5=10 (evicted key 1)").
 * 6. Animate eviction: when an item is evicted, briefly highlight it
 *    red before removing.
 *
 * Algorithm focus:
 * - O(1) get: hash map for direct key lookup.
 * - O(1) put: hash map insert + linked list append to tail.
 * - O(1) eviction: remove head of linked list + delete from hash map.
 * - O(1) "mark as recently used": move node to tail of linked list
 *   (unlink from current position, re-link at tail).
 *
 * Time target: 25 minutes.
 */

import styles from "./LruCache.module.css";

export const LruCache = () => {
  // TODO: implement

  return <div>LRU Cache</div>;
};
