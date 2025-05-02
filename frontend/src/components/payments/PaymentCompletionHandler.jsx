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
        // If it's a direct purchase (not from cart) but the item is also in cart
        if (isDirectPurchase && purchasedItems.length > 0) {
          console.log(`Selectively removing purchased items from cart: `, purchasedItems);
          
          // Remove each purchased item that exists in the cart
          purchasedItems.forEach(purchasedItemId => {
            const itemInCart = cartItems.find(item => item._id === purchasedItemId);
            if (itemInCart) {
              dispatch(removeItem(purchasedItemId));
              console.log(`Removed purchased item from cart: ${purchasedItemId}`);
            }
          });
        } 
        // For regular cart purchases, clear the entire cart
        else if (!isDirectPurchase) {
          console.log(`Payment successful for order ${orderId}. Clearing cart.`);
          dispatch(clearCart());
        }
        
        // Always clean up any stored payment info from localStorage
        localStorage.removeItem('lastEsewaOrderId');
        localStorage.removeItem('esewaPaymentInitiated');
        
        // Clean up direct purchase info
        localStorage.removeItem('isDirectPurchase');
        localStorage.removeItem('purchasedItems');
      } catch (err) {
        console.error('Error processing payment completion:', err);
      }
    }
  }, [isSuccessful, orderId, purchasedItems, isDirectPurchase, cartItems, dispatch]);
  
  // This is a utility component that doesn't render anything
  return null;
};

export default PaymentCompletionHandler; 