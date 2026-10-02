import styles from "./App.module.css";
import { WhackAMole } from "./whack-a-mole/WhackAMole";

function App() {
  return (
    <div className={styles.app}>
      <WhackAMole />
    </div>
  );
}

export default App;
