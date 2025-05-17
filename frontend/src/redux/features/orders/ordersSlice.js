import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  loading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload); // Add new order at the beginning
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrderError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearOrders: (state) => {
      state.orders = [];
    }
  }
});

export const { 
  setOrders, 
  addOrder, 
  setOrderLoading, 
  setOrderError,
  clearOrders
} = ordersSlice.actions;

export default ordersSlice.reducer; 