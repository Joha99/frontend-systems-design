import styles from "./App.module.css";
import { Wordle } from "./wordle/Wordle";

function App() {
  return (
    <div className={styles.app}>
      <Wordle />
    </div>
  );
}

export default App;
