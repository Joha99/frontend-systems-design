import styles from "./App.module.css";
import { CarSearch } from "./car-search/CarSearch";

function App() {
  return (
    <div className={styles.app}>
      <CarSearch />
    </div>
  );
}

export default App;
