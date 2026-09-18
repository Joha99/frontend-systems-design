import styles from "./App.module.css";
import { TreeSelect } from "./tree-select/TreeSelect";

function App() {
  return (
    <div className={styles.app}>
      <TreeSelect />
    </div>
  );
}

export default App;
