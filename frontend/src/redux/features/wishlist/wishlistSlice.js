import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
  wishlistItems: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const existingItem = state.wishlistItems.find(item => item.id === action.payload.id);
      if (!existingItem) {
        // Add dateAdded field for sorting
        state.wishlistItems.push({ 
          ...action.payload, 
          dateAdded: new Date().toISOString() 
        });
        
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Added to wishlist',
          showConfirmButton: false,
          timer: 1500,
          toast: true
        });
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(item => item.id !== action.payload);
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Removed from wishlist',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist,
  setLoading,
  setError
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 