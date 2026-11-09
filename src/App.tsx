import styles from "./App.module.css";
import { Part1LiveChart } from "./telemetry-chart/Part1LiveChart";

function App() {
  return (
    <div className={styles.app}>
      <Part1LiveChart />
    </div>
  );
}

export default App;
