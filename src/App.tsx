import styles from "./App.module.css";
import { CommandPalette } from "./command-palette-redo/CommandPalette";

function App() {
  return (
    <div className={styles.app}>
      <CommandPalette />
    </div>
  );
}

export default App;
