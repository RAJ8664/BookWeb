import React, { useEffect } from 'react';
import EsewaPayment from './EsewaPayment';
import PaymentCompletionHandler from './PaymentCompletionHandler';

/**
 * Payment handler component that renders the appropriate payment method
 * based on the selected payment method.
 */
const PaymentHandler = ({ paymentMethod, orderId, isDirectPurchase = false, purchasedItems = [] }) => {
  // Track the payment status for Cash on Delivery (it's always successful)
  const isCODSuccessful = paymentMethod === 'Cash on Delivery';
  
  // Store direct purchase information in localStorage for eSewa payments
  useEffect(() => {
    if (isDirectPurchase && purchasedItems.length > 0) {
      localStorage.setItem('isDirectPurchase', 'true');
      localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
    }
    return () => {
      // Clean up localStorage when component unmounts
      if (!isDirectPurchase) {
        localStorage.removeItem('isDirectPurchase');
        localStorage.removeItem('purchasedItems');
      }
    };
  }, [isDirectPurchase, purchasedItems]);
  
  // Render the appropriate payment component based on the payment method
  const renderPaymentMethod = () => {
    switch (paymentMethod) {
      case 'eSewa':
        return <EsewaPayment orderId={orderId} />;
        
      case 'Cash on Delivery':
        return (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Cash on Delivery</h3>
            <p className="mt-2 text-sm text-gray-500">
              Pay with cash when your order is delivered to your doorstep.
            </p>
          </div>
        );
        
      case 'Credit Card':
      case 'Debit Card':
        return (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{paymentMethod}</h3>
            <p className="mt-2 text-sm text-gray-500">
              Card payment integration coming soon.
            </p>
          </div>
        );
        
      case 'PayPal':
        return (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
              <span className="text-blue-500 font-bold text-xl">P</span>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">PayPal</h3>
            <p className="mt-2 text-sm text-gray-500">
              PayPal integration coming soon.
            </p>
          </div>
        );
        
      default:
        return (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700">
              Please select a payment method
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="mt-6">
      {/* Add PaymentCompletionHandler to handle cart clearing for COD orders */}
      {isCODSuccessful && (
        <PaymentCompletionHandler 
          orderId={orderId} 
          isSuccessful={true}
          isDirectPurchase={isDirectPurchase}
          purchasedItems={purchasedItems}
        />
      )}
      
      {renderPaymentMethod()}
    </div>
  );
};

export default PaymentHandler; 