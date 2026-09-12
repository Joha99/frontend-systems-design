/**
 * Pathfinding Visualizer
 *
 * Build an interactive grid where the user places walls and watches
 * BFS or DFS find the shortest path, animated step by step.
 *
 * Requirements:
 * 1. Render a 20x30 grid. Each cell starts empty (white).
 * 2. Two special cells: Start (green) and End (red). The user can
 *    drag them to reposition.
 * 3. Click and drag on empty cells to draw walls (toggle on mousedown,
 *    paint on mousemove while held). Walls block the path.
 * 4. "Visualize BFS" button: animate BFS from Start to End.
 *    - Each step, newly visited cells turn light blue (in order of visit).
 *    - Use setTimeout or requestAnimationFrame to animate one step at a time.
 *    - When the End is found, trace back the shortest path and highlight
 *      it in yellow.
 *    - If no path exists, show "No path found."
 * 5. "Visualize DFS" button: same but with DFS. Note: DFS does NOT
 *    guarantee the shortest path.
 * 6. "Clear Board" resets walls and visited state. "Clear Path" keeps
 *    walls but clears visited/path cells.
 * 7. Speed control: slow / medium / fast (changes the animation delay).
 *
 * Algorithm focus:
 * - BFS: queue-based, explores level by level (guarantees shortest path).
 *   Track parent of each cell to reconstruct the path.
 * - DFS: stack-based (or recursive), explores one branch fully before
 *   backtracking. Does not guarantee shortest path.
 * - Grid as adjacency list: each cell connects to its 4 neighbors
 *   (up/down/left/right), excluding walls and out-of-bounds.
 *
 * Time target: 35 minutes.
 */

import styles from "./Pathfinder.module.css";

export const Pathfinder = () => {
  // TODO: implement

  return <div>Pathfinder</div>;
};
