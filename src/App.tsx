import styles from "./App.module.css";
import { Part1OverlapLayout } from "./week-calendar/Part1OverlapLayout";

function App() {
  return (
    <div className={styles.app}>
      <Part1OverlapLayout />
    </div>
  );
}

export default App;
