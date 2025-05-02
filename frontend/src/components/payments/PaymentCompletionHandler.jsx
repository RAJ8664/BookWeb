import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, removeItem } from '../../redux/features/cart/cartSlice';

/**
 * Helper component to handle cart updates after successful payment
 * Now supports selectively removing only purchased items instead of clearing the entire cart
 */
const PaymentCompletionHandler = ({ orderId, isSuccessful, purchasedItems = [], isDirectPurchase = false }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  
  useEffect(() => {
    if (isSuccessful && orderId) {
      try {
        console.log('Payment Completion Handler - Start');
        console.log('Is Direct Purchase:', isDirectPurchase);
        console.log('Purchased Items:', purchasedItems);
        console.log('Current Cart Items:', cartItems);
        
        // If it's a direct purchase (not from cart) but the item is also in cart
        if (isDirectPurchase && purchasedItems.length > 0) {
          console.log(`Selectively removing purchased items from cart: `, purchasedItems);
          
          // Remove each purchased item that exists in the cart
          purchasedItems.forEach(purchasedItemId => {
            console.log(`Checking item ID: ${purchasedItemId}`);
            console.log(`ID type: ${typeof purchasedItemId}`);
            
            // Log all cart item IDs for comparison
            console.log('All cart item IDs:');
            cartItems.forEach(item => {
              console.log(`- Cart item ID: ${item._id} (type: ${typeof item._id})`);
            });
            
            // Try direct comparison and also string comparison
            const itemInCart = cartItems.find(item => 
              item._id === purchasedItemId || // Direct comparison
              item._id === String(purchasedItemId) || // String comparison 
              String(item._id) === String(purchasedItemId) // Both as strings
            );
            
            if (itemInCart) {
              console.log(`Found item in cart:`, itemInCart);
              console.log(`Dispatching removeItem with ID: ${purchasedItemId}`);
              dispatch(removeItem(purchasedItemId));
              console.log(`Removed purchased item from cart: ${purchasedItemId}`);
            } else {
              console.log(`Item with ID ${purchasedItemId} not found in cart`);
            }
          });
          
          // Log the cart items after removal attempts
          setTimeout(() => {
            const updatedCart = window.store.getState().cart.cartItems;
            console.log('Cart items after removal:', updatedCart);
          }, 100);
        } 
        // For regular cart purchases, clear the entire cart
        else if (!isDirectPurchase) {
          console.log(`Regular cart purchase. Clearing entire cart.`);
          dispatch(clearCart());
        } else {
          console.log(`No action taken - direct purchase with no items to remove`);
        }
        
        // Always clean up any stored payment info from localStorage
        localStorage.removeItem('lastEsewaOrderId');
        localStorage.removeItem('esewaPaymentInitiated');
        
        // Clean up direct purchase info
        localStorage.removeItem('isDirectPurchase');
        localStorage.removeItem('purchasedItems');
        
        console.log('Payment Completion Handler - End');
      } catch (err) {
        console.error('Error processing payment completion:', err);
      }
    }
  }, [isSuccessful, orderId, purchasedItems, isDirectPurchase, cartItems, dispatch]);
  
  // This is a utility component that doesn't render anything
  return null;
};

export default PaymentCompletionHandler; 