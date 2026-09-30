import styles from "./App.module.css";
import { PixelEditor } from "./undo-redo/PixelEditor";

function App() {
  return (
    <div className={styles.app}>
      <PixelEditor />
    </div>
  );
}

export default App;
