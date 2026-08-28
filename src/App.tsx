import styles from "./App.module.css";
import { ContactForm } from "./contact-form/ContactForm";
import { CrudList } from "./crud-list/CrudList";
import { DataTable } from "./data-table/DataTable";
import { FileExplorer } from "./file-explorer/FileExplorer";
import { GridBoard } from "./grid-board/GridBoard";
import { InfiniteScroll } from "./infinite-scroll/InfiniteScroll";
import { MultiSelect } from "./multi-select/MultiSelect";
import { MultiStepWizard } from "./multi-step-wizard/MultiStepWizard";
import { PostBrowser } from "./post-browser/PostBrowser";
import { Typeahead } from "./typeahead/Typeahead";

function App() {
  return (
    <div className={styles.app}>
      {/* <Typeahead />
      <DataTable />
      <ContactForm />
      <CrudList />
      <PostBrowser />
      <MultiStepWizard />
      <GridBoard rowCount={4} colCount={5} />
      <FileExplorer />
      <MultiSelect /> */}
      <InfiniteScroll />
    </div>
  );
}

export default App;
