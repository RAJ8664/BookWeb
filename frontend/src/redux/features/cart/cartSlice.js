import { createSlice } from '@reduxjs/toolkit'
import Swal from 'sweetalert2'

const initialState = {
    cartItems: []
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id)
            if(!existingItem) {
                state.cartItems.push({ ...action.payload, quantity: 1 })
                Swal.fire({
                title: "Item Added To Cart",
                icon: "success",
                draggable: true
});
            }
            else {
                existingItem.quantity += 1
                Swal.fire({
                    title: "Already in Cart",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "OK"
                  })
            }
        },
        incrementQuantity: (state, action) => {
            const item = state.cartItems.find(item => item._id === action.payload);
            if (item) item.quantity += 1;
        },
        decrementQuantity: (state, action) => {
            const item = state.cartItems.find(item => item._id === action.payload);
            if (item && item.quantity > 1) item.quantity -= 1;
        },
        updateCartItem: (state, action) => {
            const { _id, ...updates } = action.payload;
            const existingItem = state.cartItems.find(item => item._id === _id);
            if (existingItem) {
                // Update the item with new properties
                Object.assign(existingItem, updates);
            }
        },
        removeItem: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
        },
        clearCart: (state) => {
            state.cartItems = []
            Swal.fire({
                title: "Cart Cleared",
                icon: "success",
                draggable: true
            });
        }
    }
})

export const { 
    addToCart, 
    removeItem, 
    clearCart, 
    incrementQuantity, 
    decrementQuantity,
    updateCartItem 
} = cartSlice.actions;

export default cartSlice.reducer;
