import styles from "./App.module.css";
import { SnakeGame } from "./snake-game/SnakeGame";

function App() {
  return (
    <div className={styles.app}>
      <SnakeGame />
    </div>
  );
}

export default App;
