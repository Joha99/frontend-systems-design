/**
 * Context-Driven Paginated List (Tesla-style)
 *
 * "API call with Pagination and using React Context."
 *
 * Build a multi-component app where pagination state and data fetching
 * are managed via React Context, not prop drilling.
 *
 * Requirements:
 * 1. Create a PaginationContext that holds the current page of items,
 *    page number, total pages, loading state, error state, and
 *    navigation functions (goToPage, nextPage, prevPage).
 *
 * 2. PaginationProvider fetches data when page changes.
 *
 * 3. Three consumer components (no props passed between them):
 *    - <ItemList />     renders the current page of items
 *    - <PageControls /> Previous / Next / page input + total
 *    - <StatusBar />    shows loading, error, or "Page X of Y"
 *
 * 4. Use a mock API that returns paginated items with a delay.
 *
 * 5. Handle edge cases: disable buttons at boundaries, show error
 *    with retry.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import styles from "./ContextPaginator.module.css";
import { fetchPageItems, type Item } from "./data";

interface PaginationContextState {
  pages: Item[];
  currentPage: number;
  totalPages: number;
  fetchStatus: "loading" | "success" | "error";
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const defaultPaginationContextState: PaginationContextState = {
  pages: [],
  currentPage: 0,
  totalPages: 0,
  fetchStatus: "loading",
  goToPage: () => {},
  nextPage: () => {},
  prevPage: () => {},
};

const PaginationContext = createContext<PaginationContextState>(
  defaultPaginationContextState,
);

const PaginationContextProvider = ({ children }: PropsWithChildren) => {
  const [pages, setPages] = useState<Item[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(
    defaultPaginationContextState["currentPage"],
  );

  const [totalPages, setTotalPages] = useState<number>(
    defaultPaginationContextState["totalPages"],
  );

  const [fetchStatus, setFetchStatus] = useState<
    PaginationContextState["fetchStatus"]
  >(defaultPaginationContextState["fetchStatus"]);

  const goToPage = (page: number) => {
    onPageChange(page);
  };

  const nextPage = () => {
    onPageChange(currentPage + 1);
  };

  const prevPage = () => {
    onPageChange(currentPage - 1);
  };

  const providerValue = {
    pages,
    currentPage,
    totalPages,
    fetchStatus,
    goToPage,
    nextPage,
    prevPage,
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setFetchStatus("loading");

    fetchPageItems(page)
      .then((res) => res.json())
      .then((data) => {
        setPages(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
        setFetchStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setFetchStatus("error");
      });
  };

  useEffect(() => {
    onPageChange(1);
  }, []);

  return (
    <PaginationContext.Provider value={providerValue}>
      {children}
    </PaginationContext.Provider>
  );
};

const ItemList = () => {
  const { pages, fetchStatus } = useContext(PaginationContext);

  if (fetchStatus !== "success") return;

  return (
    <div>
      {pages.map((page) => {
        return <div key={page.id}>{page.name}</div>;
      })}
    </div>
  );
};

const PageControls = () => {
  const { currentPage, totalPages, goToPage, prevPage, nextPage, fetchStatus } =
    useContext(PaginationContext);

  const itemsLoaded = fetchStatus === "success";

  if (!itemsLoaded) return;

  return (
    <div>
      <button disabled={currentPage === 1 || !itemsLoaded} onClick={prevPage}>
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isSelected = page === currentPage;
        return (
          <button
            key={page}
            className={`${isSelected ? styles.currentPage : ""}`}
            disabled={!itemsLoaded}
            onClick={() => {
              goToPage(page);
            }}
          >
            {page}
          </button>
        );
      })}
      <button
        disabled={currentPage === totalPages || !itemsLoaded}
        onClick={nextPage}
      >
        Next
      </button>
    </div>
  );
};

const StatusBar = () => {
  const { currentPage, totalPages, fetchStatus } =
    useContext(PaginationContext);

  if (fetchStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (fetchStatus === "error") {
    return <div>There was an error.</div>;
  }

  return (
    <div>
      Showing page {currentPage} of {totalPages}
    </div>
  );
};

export const ContextPaginator = () => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Context Paginated List</h2>
      <PaginationContextProvider>
        <StatusBar />
        <ItemList />
        <PageControls />
      </PaginationContextProvider>
    </div>
  );
};
