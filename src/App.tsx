import styles from "./App.module.css";
import { Part1ListAndCursor } from "./inbox-triage/Part1ListAndCursor";
import { Part2SelectionAndShortcuts } from "./inbox-triage/Part2SelectionAndShortcuts";

function App() {
  return (
    <div className={styles.app}>
      <Part2SelectionAndShortcuts />
    </div>
  );
}

export default App;
