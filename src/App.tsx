import styles from "./App.module.css";
import { Outliner } from "./outliner/Outliner";

function App() {
  return (
    <div className={styles.app}>
      <Outliner />
    </div>
  );
}

export default App;
