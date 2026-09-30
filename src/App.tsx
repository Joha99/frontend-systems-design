import styles from "./App.module.css";
import { Part1Board } from "./keyboard-kanban/Part1Board";

function App() {
  return (
    <div className={styles.app}>
      <Part1Board />
    </div>
  );
}

export default App;
