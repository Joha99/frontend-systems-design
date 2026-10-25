import styles from "./App.module.css";
import { Part1DrawShapes } from "./mini-figma/Part1DrawShapes";
import { Part2SelectMoveLayers } from "./mini-figma/Part2SelectMoveLayers";

function App() {
  return (
    <div className={styles.app}>
      <Part2SelectMoveLayers />
    </div>
  );
}

export default App;
