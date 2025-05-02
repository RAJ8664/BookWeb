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
            const idToRemove = action.payload;
            console.log(`[cartSlice] Removing item with ID: ${idToRemove}, type: ${typeof idToRemove}`);
            
            // Create a more flexible ID matcher function
            const compareIds = (itemId, targetId) => {
                // Try different comparison strategies
                return itemId === targetId || // Direct comparison
                      String(itemId) === String(targetId) || // String comparison
                      itemId?.toString() === targetId?.toString() || // toString comparison
                      itemId === targetId?._id || // MongoDB nested ID
                      itemId?._id === targetId; // MongoDB _id vs regular id
            };
            
            // First try to filter by _id (MongoDB style)
            const initialLength = state.cartItems.length;
            state.cartItems = state.cartItems.filter(item => {
                // Check all possible ID formats (id, _id)
                const itemId = item._id || item.id;
                
                // If any ID matches, remove the item
                if (compareIds(itemId, idToRemove)) {
                    console.log(`[cartSlice] Found and removing item:`, item);
                    return false; // Remove this item
                }
                return true; // Keep this item
            });
            
            // Log whether anything was removed
            const removed = initialLength !== state.cartItems.length;
            console.log(`[cartSlice] Items removed: ${removed ? 'yes' : 'no'}, Items remaining: ${state.cartItems.length}`);
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
