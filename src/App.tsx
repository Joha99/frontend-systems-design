import styles from "./App.module.css";
import { Battleship } from "./battleship/Battleship";

function App() {
  return (
    <div className={styles.app}>
      <Battleship />
    </div>
  );
}

export default App;
