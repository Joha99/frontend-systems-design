import { useEffect, useState } from "react";
import { Modal } from "./Modal";

import "./Modal.css";

const PRODUCT_COUNT = 194;

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
}

export const AppWithModal = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://dummyjson.com/products?limit=5&skip=${(page - 1) * 5}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.products);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [page]);

  const onNavigate = (offset: number) => {
    setPage((prev) => prev + offset);
  };

  const startItem = (page - 1) * 5 + 1;
  const lastItem = page * 5;

  return (
    <Modal.Root>
      <Modal.Trigger />
      <Modal.Content>
        <header className="modal-header">
          <h3 id="header">Heading Text</h3>
          <Modal.Close />
        </header>

        <p>
          Showing {startItem}-{lastItem} of {PRODUCT_COUNT}
        </p>
        {products.map(({ id, title }) => {
          return (
            <div key={id}>
              {id}:{title}
            </div>
          );
        })}
        <div>
          <button disabled={page === 1} onClick={() => onNavigate(-1)}>
            {"<"}
          </button>
          <button
            disabled={page === Math.ceil(PRODUCT_COUNT / 5)}
            onClick={() => onNavigate(1)}
          >
            {">"}
          </button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
