/**
 * Utility functions for handling direct purchases (buying items not from cart)
 */

/**
 * Set up a direct purchase session in localStorage
 * Call this when user initiates a purchase directly from product page
 * @param {string|string[]} itemIds - ID(s) of item(s) being purchased directly
 */
export const setupDirectPurchase = (itemIds) => {
  // Convert single ID to array if needed
  const purchasedItems = Array.isArray(itemIds) ? itemIds : [itemIds];
  
  console.log('[DEBUG] Setting up direct purchase with items:', purchasedItems);
  
  // Store in localStorage
  localStorage.setItem('isDirectPurchase', 'true');
  localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
  
  console.log('Direct purchase set up for items:', purchasedItems);
  return purchasedItems;
};

/**
 * Clear direct purchase information from localStorage
 * Call this when direct purchase is completed or canceled
 */
export const clearDirectPurchase = () => {
  localStorage.removeItem('isDirectPurchase');
  localStorage.removeItem('purchasedItems');
  console.log('Direct purchase information cleared');
};

/**
 * Check if the current session is a direct purchase
 * @returns {boolean} True if this is a direct purchase session
 */
export const isDirectPurchase = () => {
  return localStorage.getItem('isDirectPurchase') === 'true';
};

/**
 * Get the IDs of items being directly purchased
 * @returns {string[]} Array of item IDs
 */
export const getDirectPurchaseItems = () => {
  try {
    return JSON.parse(localStorage.getItem('purchasedItems') || '[]');
  } catch (e) {
    console.error('Error parsing direct purchase items:', e);
    return [];
  }
}; 