import styles from "./App.module.css";
import { Part2KeyboardDrag } from "./keyboard-kanban/Part2KeyboardDrag";

function App() {
  return (
    <div className={styles.app}>
      <Part2KeyboardDrag />
    </div>
  );
}

export default App;
