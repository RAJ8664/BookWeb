import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import booksAPI from "./features/books/booksAPI";
import ordersApi from "./features/orders/ordersApi";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [booksAPI.reducerPath]: booksAPI.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(booksAPI.middleware, ordersApi.middleware),
});
