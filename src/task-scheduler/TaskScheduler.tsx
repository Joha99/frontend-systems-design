/**
 * Priority Task Scheduler
 *
 * Build a task queue with priorities, implemented with a min-heap,
 * that processes tasks in priority order.
 *
 * Requirements:
 * 1. Implement a MinHeap class with:
 *    - insert(task): add a task with a priority (lower = higher priority).
 *    - extractMin(): remove and return the highest-priority task.
 *    - peek(): view the highest-priority task without removing.
 *    - size(): number of tasks in the heap.
 *    Internal: array-based heap. Parent at i, children at 2i+1 and 2i+2.
 *    bubbleUp on insert, bubbleDown on extract.
 * 2. "Add Task" form: name and priority (1-10). Inserting into the heap
 *    updates the visual.
 * 3. Visualize the heap as a binary tree (not an array). Show each node
 *    with task name and priority. Use CSS to lay out the tree with
 *    flexbox or absolute positioning per level.
 * 4. "Process Next" button: extracts the min, shows which task was
 *    processed, animates it being removed, and the heap rebalancing.
 * 5. "Process All" button: extracts tasks one at a time with a delay,
 *    showing the processing order.
 * 6. Show the underlying array representation alongside the tree view.
 *
 * Algorithm focus:
 * - Heap property: parent.priority <= children.priority (min-heap).
 * - bubbleUp: after insert at end, swap with parent while smaller.
 *   Parent index = Math.floor((i - 1) / 2).
 * - bubbleDown: after extracting root (swap root with last, pop),
 *   swap with smaller child while larger. Left child = 2i+1, right = 2i+2.
 * - Insert: O(log n), Extract: O(log n), Peek: O(1).
 *
 * Time target: 30 minutes.
 */

import styles from "./TaskScheduler.module.css";

export const TaskScheduler = () => {
  // TODO: implement

  return <div>Task Scheduler</div>;
};
