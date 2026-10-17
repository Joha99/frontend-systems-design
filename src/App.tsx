import styles from "./App.module.css";
import { Part1ListAndCursor } from "./inbox-triage/Part1ListAndCursor";

function App() {
  return (
    <div className={styles.app}>
      <Part1ListAndCursor />
    </div>
  );
}

export default App;
