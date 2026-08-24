import styles from "./App.module.css";
import { ContactForm } from "./contact-form/ContactForm";
import { DataTable } from "./data-table/DataTable";
import { Typeahead } from "./typeahead/Typeahead";

function App() {
  return (
    <div className={styles.app}>
      <Typeahead />
      <DataTable />
      <ContactForm />
    </div>
  );
}

export default App;
