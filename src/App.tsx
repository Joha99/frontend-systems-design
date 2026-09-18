import styles from "./App.module.css";
import { ContextPaginator } from "./context-paginator/ContextPaginator";

function App() {
  return (
    <div className={styles.app}>
      <ContextPaginator />
    </div>
  );
}

export default App;
