export interface Item {
  id: number;
  name: string;
}

export const ALL_ITEMS: Item[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

export const PAGE_SIZE = 5;

export const fetchPageItems = (
  page: number,
): Promise<{
  json: () => Promise<{
    items: Item[];
    pageSize: number;
    total: number;
  }>;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response: {
        json: () => Promise<{
          items: Item[];
          pageSize: number;
          total: number;
        }>;
      } = {
        json: () =>
          new Promise((resolve) => {
            const items = [...ALL_ITEMS];
            const pageItems = items.slice(
              (page - 1) * PAGE_SIZE,
              page * PAGE_SIZE,
            );
            resolve({
              items: pageItems,
              pageSize: PAGE_SIZE,
              total: ALL_ITEMS.length,
            });
          }),
      };
      resolve(response);
    }, 1000);
  });
};
