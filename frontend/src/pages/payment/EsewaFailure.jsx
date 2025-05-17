import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EsewaFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clean up localStorage items related to eSewa payment
    localStorage.removeItem('lastEsewaOrderId');
    localStorage.removeItem('esewaPaymentInitiated');
    
    // Show failure alert
    Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: 'Your eSewa payment was not successful. Please try again or choose a different payment method.',
      confirmButtonText: 'Return to Checkout'
    }).then(() => {
      navigate('/checkout');
    });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-800">Payment Failed</h2>
        <p className="mt-2 text-gray-600">
          Your payment through eSewa was not successful. There might have been an issue with the transaction.
        </p>
        
        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Return to Checkout
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="text-blue-600 hover:text-blue-800 py-2 px-4 transition-colors text-sm"
          >
            Need help? Contact support
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure; 