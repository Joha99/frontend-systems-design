import styles from "./App.module.css";
import { Typeahead } from "./typeahead/Typeahead";

function App() {
  return (
    <div className={styles.app}>
      <Typeahead />
    </div>
  );
}

export default App;
