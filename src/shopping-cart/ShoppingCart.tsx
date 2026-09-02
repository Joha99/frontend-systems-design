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
 * Products:
 * const PRODUCTS = [
 *   { id: 1, name: "Laptop", price: 999 },
 *   { id: 2, name: "Headphones", price: 149 },
 *   { id: 3, name: "Keyboard", price: 79 },
 *   { id: 4, name: "Mouse", price: 49 },
 *   { id: 5, name: "Monitor", price: 399 },
 * ];
 *
 * Time target: 15 minutes.
 */

import styles from "./ShoppingCart.module.css";

export const ShoppingCart = () => {
  return <div>Shopping Cart</div>;
};
