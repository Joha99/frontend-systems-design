import styles from "./App.module.css";
import { TradingDashboard } from "./trading-dashboard/TradingDashboard";

function App() {
  return (
    <div className={styles.app}>
      <TradingDashboard />
    </div>
  );
}

export default App;
