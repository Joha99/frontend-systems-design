import styles from "./App.module.css";
import { CharCounter } from "./char-counter/CharCounter";
import { Chat } from "./chat/Chat";
import { ContactForm } from "./contact-form/ContactForm";
import { DebouncedSearch } from "./debounced-search/DebouncedSearch";
import { Kanban } from "./kanban/Kanban";
import { NestedComments } from "./nested-comments/NestedComments";
import { CrudList } from "./crud-list/CrudList";
import { DataTable } from "./data-table/DataTable";
import { FileExplorer } from "./file-explorer/FileExplorer";
import { GridBoard } from "./grid-board/GridBoard";
import { InfiniteScroll } from "./infinite-scroll/InfiniteScroll";
import { LazyImages } from "./lazy-images/LazyImages";
import { MultiSelect } from "./multi-select/MultiSelect";
import { MultiStepWizard } from "./multi-step-wizard/MultiStepWizard";
import { PostBrowser } from "./post-browser/PostBrowser";
import { ToggleCounter } from "./toggle-counter/ToggleCounter";
import { ThrottledResize } from "./throttled-resize/ThrottledResize";
import { Typeahead } from "./typeahead/Typeahead";
import { UserMatrix } from "./user-matrix/UserMatrix";
import { ShoppingCart } from "./shopping-cart/ShoppingCart";
import { TooltipHover } from "./tooltip-hover/TooltipHover";

function App() {
  return (
    <div className={styles.app}>
      {/* <Typeahead /> */}
      {/* <DataTable /> */}
      {/* <ContactForm /> */}
      {/* <CrudList /> */}
      {/* <PostBrowser /> */}
      {/* <MultiStepWizard /> */}
      {/* <GridBoard rowCount={4} colCount={5} /> */}
      {/* <FileExplorer /> */}
      {/* <MultiSelect /> */}
      {/* <InfiniteScroll />  */}
      {/* <UserMatrix />  */}
      {/* <Chat />  */}
      {/* <ToggleCounter />  */}
      {/* <CharCounter />  */}
      {/* <DebouncedSearch />  */}
      {/* <NestedComments />  */}
      {/* <ThrottledResize />  */}
      {/* <ShoppingCart /> */}
      {/* <TooltipHover /> */}
      {/* <LazyImages /> */}
      {/* <CharCounter /> */}
      <Kanban />
    </div>
  );
}

export default App;
