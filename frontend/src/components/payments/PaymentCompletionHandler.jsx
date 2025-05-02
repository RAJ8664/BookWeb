import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';

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
          
          // Create a more flexible ID matcher function (same as in cartSlice)
          const compareIds = (itemId, targetId) => {
            // Try different comparison strategies
            return itemId === targetId || // Direct comparison
                 String(itemId) === String(targetId) || // String comparison
                 itemId?.toString() === targetId?.toString() || // toString comparison
                 itemId === targetId?._id || // MongoDB nested ID
                 itemId?._id === targetId; // MongoDB _id vs regular id
          };

          // Find all items to remove
          const itemsToRemove = cartItems.filter(cartItem => {
            // Check if this cart item's ID matches any of the purchased item IDs
            return purchasedItems.some(purchasedId => 
              compareIds(cartItem._id, purchasedId));
          });
          
          console.log('Items that will be removed:', itemsToRemove);
          
          // If we found items to remove, dispatch actions to remove them
          if (itemsToRemove.length > 0) {
            // IMPORTANT: We'll directly update the cart in the Redux store
            // Get the Redux store and dispatch directly
            const store = window.store;
            if (store) {
              // Get current cart items
              let updatedCartItems = [...cartItems];
              
              // Remove each matched item
              itemsToRemove.forEach(itemToRemove => {
                console.log(`Removing item from cart:`, itemToRemove.title || itemToRemove._id);
                
                // Filter out the item from our updated cart
                updatedCartItems = updatedCartItems.filter(item => 
                  !compareIds(item._id, itemToRemove._id)
                );
              });
              
              // Dispatch a complete cart update action
              store.dispatch({
                type: 'cart/updateEntireCart',
                payload: updatedCartItems
              });
              
              console.log('Updated cart with items removed');
            } else {
              console.error('Store not available on window object');
              
              // Fallback to clearing the entire cart if we can't selectively remove
              dispatch(clearCart());
            }
          } else {
            console.log('No matching items found in cart to remove');
          }
          
          // Log the cart items after removal attempts
          setTimeout(() => {
            const updatedCart = window.store?.getState().cart.cartItems || [];
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