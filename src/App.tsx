import styles from "./App.module.css";
import { VirtualTable } from "./virtual-table/VirtualTable";

function App() {
  return (
    <div className={styles.app}>
      <VirtualTable />
    </div>
  );
}

export default App;
