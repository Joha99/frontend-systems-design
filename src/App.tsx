import styles from "./App.module.css";
import { Minesweeper } from "./minesweeper/Minesweeper";

function App() {
  return (
    <div className={styles.app}>
      <Minesweeper />
    </div>
  );
}

export default App;
