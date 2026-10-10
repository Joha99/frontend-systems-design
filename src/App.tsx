import styles from "./App.module.css";
import { Part1BuildTree } from "./file-grouping/Part1BuildTree";
// import { Battleship } from "./battleship/Battleship";

function App() {
  return (
    <div className={styles.app}>
      <Part1BuildTree />
      {/* <Battleship /> */}
    </div>
  );
}

export default App;
