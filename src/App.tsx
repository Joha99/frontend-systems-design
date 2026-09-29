import styles from "./App.module.css";
import { AutosaveNotes } from "./autosave-notes/AutosaveNotes";

function App() {
  return (
    <div className={styles.app}>
      <AutosaveNotes />
    </div>
  );
}

export default App;
