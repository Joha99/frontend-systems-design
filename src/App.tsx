import styles from "./App.module.css";
import { ImageCarousel } from "./image-carousel/ImageCarousel";
// Up next:
// import { Battleship } from "./battleship/Battleship";
// import { Part3ServerSync } from "./keyboard-kanban/Part3ServerSync";

function App() {
  return (
    <div className={styles.app}>
      <ImageCarousel />
      {/* <Battleship /> */}
      {/* <Part3ServerSync /> */}
    </div>
  );
}

export default App;
