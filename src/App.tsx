import styles from "./App.module.css";
import { CrudDashboard } from "./crud-dashboard/CrudDashboard";

function App() {
  return (
    <div className={styles.app}>
      <CrudDashboard />
    </div>
  );
}

export default App;
