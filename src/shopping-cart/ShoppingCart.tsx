/**
 * Shopping Cart with useReducer
 *
 * Build a shopping cart using useReducer for state management.
 *
 * Requirements:
 * 1. Display a list of products with name, price, and "Add to Cart" button.
 * 2. Display a cart section showing added items with quantity and line total.
 * 3. Support these actions via useReducer:
 *    - ADD_ITEM: adds item to cart (or increments quantity if already in cart)
 *    - REMOVE_ITEM: removes item from cart entirely
 *    - INCREMENT: increases quantity by 1
 *    - DECREMENT: decreases quantity by 1 (removes item if quantity reaches 0)
 *    - CLEAR_CART: empties the cart
 * 4. Show the cart total (sum of all line totals) at the bottom.
 * 5. Each cart item has +, -, and "Remove" buttons.
 * 6. "Add to Cart" button is disabled for items already in the cart.
 *
 * Time target: 15 minutes.
 */

import { useReducer } from "react";
import "./ShoppingCart.css";

interface Product {
  id: number;
  name: string;
  price: number;
  count?: number;
}

type ShoppingCartState = Record<"cart" | "products", Record<number, Product>>;

type ReducerAction =
  | { type: "ADD_ITEM"; id: number }
  | { type: "REMOVE_ITEM"; id: number }
  | { type: "INCREMENT"; id: number }
  | { type: "DECREMENT"; id: number }
  | { type: "CLEAR_CART" };

const reducer = (
  prevState: ShoppingCartState,
  action: ReducerAction,
): ShoppingCartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { [action.id]: product, ...restOfProducts } = prevState.products;
      return {
        cart: { ...prevState.cart, [action.id]: { ...product, count: 1 } },
        products: restOfProducts,
      };
    }
    case "REMOVE_ITEM": {
      const { [action.id]: product, ...restOfCart } = prevState.cart;
      const { count, ...productWithoutCount } = product;
      return {
        cart: restOfCart,
        products: { ...prevState.products, [action.id]: productWithoutCount },
      };
    }
    case "INCREMENT": {
      const product = prevState.cart[action.id];
      return {
        products: prevState.products,
        cart: {
          ...prevState.cart,
          [action.id]: { ...product, count: product.count! + 1 },
        },
      };
    }
    case "DECREMENT": {
      const product = prevState.cart[action.id];
      return {
        products: prevState.products,
        cart: {
          ...prevState.cart,
          [action.id]: { ...product, count: product.count! - 1 },
        },
      };
    }
    case "CLEAR_CART": {
      const clearedProducts = Object.values(prevState.cart).reduce<
        Record<number, Product>
      >((acc, { count, ...product }) => {
        acc[product.id] = product;
        return acc;
      }, {});
      return {
        cart: {},
        products: { ...clearedProducts, ...prevState.products },
      };
    }
  }
};

const initialState: ShoppingCartState = {
  cart: {},
  products: {
    1: { id: 1, name: "Laptop", price: 999 },
    2: { id: 2, name: "Headphones", price: 149 },
    3: { id: 3, name: "Keyboard", price: 79 },
    4: { id: 4, name: "Mouse", price: 49 },
    5: { id: 5, name: "Monitor", price: 399 },
  },
};

export const ShoppingCart = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const cartItems = Object.values(state.cart);
  const availableProducts = Object.values(state.products);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.count!,
    0,
  );
  const cartValue = cartItems.reduce(
    (acc, item) => acc + item.count! * item.price,
    0,
  );

  const handleDecrement = (id: number) => {
    if (state.cart[id].count === 1) {
      dispatch({ type: "REMOVE_ITEM", id });
    } else {
      dispatch({ type: "DECREMENT", id });
    }
  };

  return (
    <div>
      <div>
        <h3>Total items in cart: {cartTotal}</h3>
        <h4>Total cost: ${cartValue}</h4>
        {cartItems.map((product) => (
          <div key={product.id} className="product">
            <div className="productDescription">
              <p>{product.name}</p>
              <p>${product.price}</p>
              <p>x{product.count}</p>
            </div>
            <div>
              <button onClick={() => dispatch({ type: "INCREMENT", id: product.id })}>+</button>
              <button onClick={() => handleDecrement(product.id)}>-</button>
              <button onClick={() => dispatch({ type: "REMOVE_ITEM", id: product.id })}>Remove</button>
            </div>
          </div>
        ))}
        <button onClick={() => dispatch({ type: "CLEAR_CART" })}>Clear cart</button>
      </div>
      <div>
        <h3>Products</h3>
        {availableProducts.map((product) => (
          <div key={product.id} className="product">
            <div className="productDescription">
              <p>{product.name}</p>
              <p>${product.price}</p>
            </div>
            <button onClick={() => dispatch({ type: "ADD_ITEM", id: product.id })}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};
