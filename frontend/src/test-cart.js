/**
 * Test script to diagnose cart issues
 * This can be run from browser console to test cart functionality
 */

function testCartRemoval() {
  console.log("====== TESTING CART ITEM REMOVAL ======");
  
  // Get the current Redux store state
  const store = window.store;
  if (!store) {
    console.error("Redux store not available on window object");
    return;
  }
  
  // Get current cart items
  const cartItems = store.getState().cart.cartItems;
  console.log("Current cart items:", cartItems);
  
  if (cartItems.length === 0) {
    console.log("Cart is empty. Add some items to test removal.");
    return;
  }
  
  // Create a more flexible ID matcher function (same as in cartSlice)
  const compareIds = (itemId, targetId) => {
    // Try different comparison strategies
    return itemId === targetId || // Direct comparison
          String(itemId) === String(targetId) || // String comparison
          itemId?.toString() === targetId?.toString() || // toString comparison
          itemId === targetId?._id || // MongoDB nested ID
          itemId?._id === targetId; // MongoDB _id vs regular id
  };
  
  // Choose first cart item to test removal
  const testItem = cartItems[0];
  console.log("Test item:", testItem);
  const testItemId = testItem._id;
  console.log("Test item ID:", testItemId, "Type:", typeof testItemId);
  
  console.log("---- Testing Cart Remove Action ----");
  // Try using removeItem action
  console.log("Dispatching removeItem action...");
  store.dispatch({
    type: 'cart/removeItem',
    payload: testItemId
  });
  
  // Check if item was removed
  setTimeout(() => {
    const updatedCart = store.getState().cart.cartItems;
    console.log("Cart after removeItem:", updatedCart);
    
    const itemStillExists = updatedCart.some(item => compareIds(item._id, testItemId));
    if (itemStillExists) {
      console.log("❌ Item was NOT removed using removeItem action");
    } else {
      console.log("✅ Item was successfully removed using removeItem action");
    }
    
    // If item not removed, try updateEntireCart action
    if (itemStillExists) {
      console.log("---- Testing Cart Update Entire Cart Action ----");
      
      // Filter out the test item manually
      const filteredCart = updatedCart.filter(item => !compareIds(item._id, testItemId));
      console.log("Filtered cart:", filteredCart);
      
      console.log("Dispatching updateEntireCart action...");
      store.dispatch({
        type: 'cart/updateEntireCart',
        payload: filteredCart
      });
      
      // Check if item was removed
      setTimeout(() => {
        const finalCart = store.getState().cart.cartItems;
        console.log("Cart after updateEntireCart:", finalCart);
        
        const itemStillExistsAfterUpdate = finalCart.some(item => compareIds(item._id, testItemId));
        if (itemStillExistsAfterUpdate) {
          console.log("❌ Item was NOT removed using updateEntireCart action");
        } else {
          console.log("✅ Item was successfully removed using updateEntireCart action");
        }
        
        console.log("====== TEST COMPLETE ======");
      }, 100);
    } else {
      console.log("====== TEST COMPLETE ======");
    }
  }, 100);
}

// Function to simulate buying an item directly
function testDirectPurchase() {
  console.log("====== TESTING DIRECT PURCHASE ======");
  
  // Get the current Redux store state
  const store = window.store;
  if (!store) {
    console.error("Redux store not available on window object");
    return;
  }
  
  // Get current cart items
  const cartItems = store.getState().cart.cartItems;
  console.log("Current cart items:", cartItems);
  
  if (cartItems.length === 0) {
    console.log("Cart is empty. Add some items to test direct purchase.");
    return;
  }
  
  // Choose first cart item for direct purchase
  const testItem = cartItems[0];
  console.log("Test item for direct purchase:", testItem);
  
  // Set up direct purchase
  localStorage.setItem('isDirectPurchase', 'true');
  localStorage.setItem('purchasedItems', JSON.stringify([testItem._id]));
  
  console.log("Direct purchase set up for item:", testItem._id);
  
  // Manually simulate PaymentCompletionHandler
  console.log("Simulating PaymentCompletionHandler...");
  
  // Create a more flexible ID matcher function (same as in cartSlice)
  const compareIds = (itemId, targetId) => {
    // Try different comparison strategies
    return itemId === targetId || // Direct comparison
          String(itemId) === String(targetId) || // String comparison
          itemId?.toString() === targetId?.toString() || // toString comparison
          itemId === targetId?._id || // MongoDB nested ID
          itemId?._id === targetId; // MongoDB _id vs regular id
  };
  
  const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
  console.log("Purchased items:", purchasedItems);
  
  // Find all items to remove
  const itemsToRemove = cartItems.filter(cartItem => {
    // Check if this cart item's ID matches any of the purchased item IDs
    return purchasedItems.some(purchasedId => compareIds(cartItem._id, purchasedId));
  });
  
  console.log("Items that will be removed:", itemsToRemove);
  
  // If we found items to remove, dispatch actions to remove them
  if (itemsToRemove.length > 0) {
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
    
    console.log("Updated cart items:", updatedCartItems);
    
    // Dispatch a complete cart update action
    store.dispatch({
      type: 'cart/updateEntireCart',
      payload: updatedCartItems
    });
    
    console.log("Updated cart with items removed");
  } else {
    console.log("No matching items found in cart to remove");
  }
  
  // Clean up
  localStorage.removeItem('isDirectPurchase');
  localStorage.removeItem('purchasedItems');
  
  // Check final result
  setTimeout(() => {
    const finalCart = store.getState().cart.cartItems;
    console.log("Final cart after removal:", finalCart);
    
    const itemStillExists = finalCart.some(item => compareIds(item._id, testItem._id));
    if (itemStillExists) {
      console.log("❌ Item was NOT removed from cart");
    } else {
      console.log("✅ Item was successfully removed from cart");
    }
    
    console.log("====== TEST COMPLETE ======");
  }, 100);
}

// Expose test functions to window
window.testCartRemoval = testCartRemoval;
window.testDirectPurchase = testDirectPurchase;

console.log("Cart testing utilities loaded!");
console.log("Run window.testCartRemoval() to test cart item removal");
console.log("Run window.testDirectPurchase() to test direct purchase flow"); 