import styles from "./App.module.css";
import { ContactForm } from "./contact-form/ContactForm";
import { CrudList } from "./crud-list/CrudList";
import { DataTable } from "./data-table/DataTable";
import { PostBrowser } from "./post-browser/PostBrowser";
import { Typeahead } from "./typeahead/Typeahead";

function App() {
  return (
    <div className={styles.app}>
      <Typeahead />
      <DataTable />
      <ContactForm />
      <CrudList />
      <PostBrowser />
    </div>
  );
}

export default App;
