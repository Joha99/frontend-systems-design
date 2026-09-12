/**
 * CRUD Dashboard (Products Manager)
 *
 * API:
 *   GET    https://dummyjson.com/products?limit=20
 *   POST   https://dummyjson.com/products/add       body: { title, price }
 *   PUT    https://dummyjson.com/products/:id        body: { title, price }
 *   DELETE https://dummyjson.com/products/:id
 *
 * Requirements:
 * 1. Fetch 20 products on mount. Display as cards with title, price, category.
 * 2. "Add Product" inline form (title, price). POST to API, add on success.
 * 3. Edit (inline form, PUT) and Delete (DELETE) per card. Cancel reverts edit.
 * 4. Debounced search (300ms), client-side filter by title.
 */

import { useEffect, useState, type ChangeEvent } from "react";
import styles from "./CrudDashboard.module.css";

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
}

type ProductMap = Record<number, Product>;

const isValid = (title?: string, price?: number) =>
  title !== undefined && title !== "" && price !== undefined && price > 0;

export const CrudDashboard = () => {
  const [products, setProducts] = useState<ProductMap>({});
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [editedItemId, setEditedItemId] = useState<number>();
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPrice, setEditedPrice] = useState<number>();

  const [isAdding, setIsAdding] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState<number>();

  const filteredProducts = Object.values(products).filter(({ title }) =>
    title.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=20")
      .then((res) => res.json())
      .then((json) => {
        const map: ProductMap = {};
        json.products.forEach((p: Product) => {
          map[p.id] = p;
        });
        setProducts(map);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  const onDelete = (id: number) => {
    fetch(`https://dummyjson.com/products/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setProducts((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      })
      .catch((err) => console.error(err));
  };

  const resetAddForm = () => {
    setFormTitle("");
    setFormPrice(undefined);
    setIsAdding(false);
  };

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid(formTitle, formPrice)) return;

    fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formTitle, price: formPrice }),
    })
      .then((res) => res.json())
      .then((product: Product) => {
        setProducts((prev) => ({ ...prev, [product.id]: product }));
        resetAddForm();
      })
      .catch((err) => console.error(err));
  };

  const startEdit = (product: Product) => {
    setEditedItemId(product.id);
    setEditedTitle(product.title);
    setEditedPrice(product.price);
  };

  const cancelEdit = () => {
    setEditedItemId(undefined);
    setEditedTitle("");
    setEditedPrice(undefined);
  };

  const saveEdit = () => {
    if (!isValid(editedTitle, editedPrice)) return;

    fetch(`https://dummyjson.com/products/${editedItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editedTitle, price: editedPrice }),
    })
      .then((res) => res.json())
      .then((product: Product) => {
        setProducts((prev) => ({ ...prev, [product.id]: product }));
        cancelEdit();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className={styles.grid}>
      <div>
        <header className={styles.header}>
          <h4>Products</h4>
          <input
            type="text"
            placeholder="Search for product"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.currentTarget.value)
            }
          />
          <button onClick={() => setIsAdding(true)}>Add product +</button>
        </header>
        <div className={styles.productList}>
          {filteredProducts.map((product) => {
            const { id, title, category, price } = product;
            const isEditing = editedItemId === id;

            return (
              <div key={id} className={styles.product}>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder={title}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.currentTarget.value)}
                  />
                ) : (
                  <h5>
                    {title} ({category})
                  </h5>
                )}
                {isEditing ? (
                  <input
                    type="number"
                    placeholder={String(price)}
                    value={editedPrice}
                    onChange={(e) =>
                      setEditedPrice(parseFloat(e.currentTarget.value))
                    }
                  />
                ) : (
                  <p>${price}</p>
                )}
                <div>
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={!isValid(editedTitle, editedPrice)}
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(product)}>Edit</button>
                  )}
                  <button onClick={() => onDelete(id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdding && (
        <div>
          <h3>Add new item</h3>
          <form className={styles.form} onSubmit={onAdd} onReset={resetAddForm}>
            <div>
              <label htmlFor="new-title">Title</label>
              <input
                id="new-title"
                type="text"
                placeholder="Product name"
                value={formTitle}
                onChange={(e) => setFormTitle(e.currentTarget.value)}
              />
            </div>
            <div>
              <label htmlFor="new-price">Price</label>
              <input
                id="new-price"
                type="number"
                placeholder="9.99"
                value={formPrice}
                onChange={(e) => setFormPrice(parseFloat(e.currentTarget.value))}
              />
            </div>
            <div>
              <button type="submit" disabled={!isValid(formTitle, formPrice)}>
                Add
              </button>
              <button type="reset">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
