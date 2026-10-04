import styles from "./App.module.css";
import { StockWatchlist } from "./stock-watchlist/StockWatchlist";

function App() {
  return (
    <div className={styles.app}>
      <StockWatchlist />
    </div>
  );
}

export default App;
