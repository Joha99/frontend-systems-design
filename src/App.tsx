import styles from "./App.module.css";
import { Part1LiveFleet } from "./robot-fleet/Part1LiveFleet";

function App() {
  return (
    <div className={styles.app}>
      <Part1LiveFleet />
    </div>
  );
}

export default App;
