import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import ordersReducer from "./features/orders/ordersSlice";
import booksAPI from "./features/books/booksAPI";
import ordersApi from "./features/orders/ordersApi";
import esewaApi from "./features/payments/esewaApi";
import { bookRequestApi } from "./features/bookRequest/bookRequestApi";

// Load state from localStorage
const loadState = () => {
  try {
    const cartState = localStorage.getItem('cartState');
    const wishlistState = localStorage.getItem('wishlistState');
    
    return {
      cart: cartState ? JSON.parse(cartState) : undefined,
      wishlist: wishlistState ? JSON.parse(wishlistState) : undefined
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

// Middleware to save state to localStorage
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Only save to localStorage if the action affects cart or wishlist
  if (action.type.startsWith('cart/') || action.type.startsWith('wishlist/')) {
    const state = store.getState();
    
    if (action.type.startsWith('cart/')) {
      localStorage.setItem('cartState', JSON.stringify(state.cart));
    }
    
    if (action.type.startsWith('wishlist/')) {
      localStorage.setItem('wishlistState', JSON.stringify(state.wishlist));
    }
  }
  
  return result;
};

// Get preloaded state
const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    [booksAPI.reducerPath]: booksAPI.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [bookRequestApi.reducerPath]: bookRequestApi.reducer,
    [esewaApi.reducerPath]: esewaApi.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      booksAPI.middleware, 
      ordersApi.middleware,
      localStorageMiddleware,
      bookRequestApi.middleware,
      esewaApi.middleware
    ),
});
