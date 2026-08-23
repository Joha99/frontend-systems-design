import styles from "./App.module.css";
import { DataTable } from "./data-table/DataTable";
import { Typeahead } from "./typeahead/Typeahead";

function App() {
  return (
    <div className={styles.app}>
      <Typeahead />
      <DataTable />
    </div>
  );
}

export default App;
