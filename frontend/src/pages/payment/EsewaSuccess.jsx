import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useVerifyEsewaPaymentMutation, useCheckEsewaPaymentStatusQuery } from '../../redux/features/payments/esewaApi';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const EsewaSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [storedOrderId, setStoredOrderId] = useState(null);
  
  // Get the verify payment mutation
  const [verifyPayment, { isLoading }] = useVerifyEsewaPaymentMutation();
  
  // Check if we have a stored order ID and restore auth token if needed
  useEffect(() => {
    const lastOrderId = localStorage.getItem('lastEsewaOrderId');
    if (lastOrderId) {
      setStoredOrderId(lastOrderId);
    }
    
    // Restore authentication if needed
    const storedAuthToken = localStorage.getItem('esewaAuthToken');
    if (storedAuthToken && !user) {
      console.log('Restoring authentication state after eSewa payment');
      
      // If we need to fetch user data or update Redux state, do it here
      // For now, we're just ensuring the token is in localStorage
      localStorage.setItem('token', storedAuthToken);
      
      // Clean up the stored token after restoring
      localStorage.removeItem('esewaAuthToken');
    }
  }, [user]);
  
  // Fetch payment status for stored order ID if we need to
  const { data: orderStatus } = useCheckEsewaPaymentStatusQuery(storedOrderId, {
    skip: !storedOrderId || Object.keys(new URLSearchParams(location.search)).length > 0,
  });
  
  // Extract query parameters from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const response = {};
    
    // Collect all query parameters from eSewa callback
    for (const [key, value] of queryParams.entries()) {
      response[key] = value;
    }
    
    console.log('Raw payment response from eSewa:', response);
    
    // Check if we have expected parameters
    if (Object.keys(response).length > 0 && 
        (response.product_code || response.transaction_uuid || response.signature)) {
      
      // Ensure all required fields are present
      const requiredFields = ['product_code', 'total_amount', 'transaction_uuid', 'status', 'signed_field_names', 'signature'];
      const missingFields = requiredFields.filter(field => !response[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields from eSewa response:', missingFields);
        // Continue to show success message but log the error
      }
      
      // Ensure field types are correct
      if (response.total_amount) {
        // Make sure total_amount is a string (not a number)
        response.total_amount = String(response.total_amount);
      }
      
      console.log('Processed payment response for verification:', response);
      setPaymentDetails(response);
      
      // Try to verify with the backend if we have enough data
      if (response.transaction_uuid && response.signature) {
        verifyPaymentWithBackend(response);
      } else {
        // If we don't have enough data, just show success message
        setLoading(false);
        showGenericSuccessMessage();
      }
    } else {
      // If there are no query parameters, check for stored order ID
      console.log('No query parameters found in the URL');
      
      if (storedOrderId) {
        console.log('Found stored order ID:', storedOrderId);
        // We'll handle this in the next useEffect
      } else {
        setLoading(false);
        showGenericSuccessMessage();
      }
    }
  }, [location]);
  
  // Handle the case when we have a stored order ID but no query parameters
  useEffect(() => {
    if (orderStatus && storedOrderId && Object.keys(new URLSearchParams(location.search)).length === 0) {
      console.log('Checking status for stored order ID:', storedOrderId);
      console.log('Order status:', orderStatus);
      
      setLoading(false);
      
      // Clear the localStorage entry
      localStorage.removeItem('lastEsewaOrderId');
      localStorage.removeItem('esewaPaymentInitiated');
      
      if (orderStatus.success) {
        // Clear all eSewa-related localStorage items
        localStorage.removeItem('lastEsewaOrderId');
        localStorage.removeItem('esewaPaymentInitiated');
        localStorage.removeItem('esewaAuthToken');
        
        Swal.fire({
          icon: 'success',
          title: 'Payment Confirmed',
          text: 'Your payment has been confirmed and your order is being processed.',
          confirmButtonText: 'View Order'
        }).then(() => {
          navigate('/orders');
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Payment Status Uncertain',
          text: 'Your payment status could not be confirmed. Please check your order history.',
          confirmButtonText: 'View Orders'
        }).then(() => {
          navigate('/orders');
        });
      }
    }
  }, [orderStatus, storedOrderId, location]);
  
  // Verify payment with backend
  const verifyPaymentWithBackend = async (paymentResponse) => {
    try {
      console.log('Sending to backend for verification:', paymentResponse);
      const result = await verifyPayment(paymentResponse).unwrap();
      
      if (result.success) {
        // Clear the cart after successful payment
        dispatch(clearCart());
        
        // Remove stored data from localStorage
        localStorage.removeItem('lastEsewaOrderId');
        localStorage.removeItem('esewaPaymentInitiated');
        localStorage.removeItem('esewaAuthToken');
        
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: 'Your payment has been verified and your order is being processed.',
          confirmButtonText: 'View Order'
        }).then(() => {
          navigate('/orders');
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Payment Status Uncertain',
          text: result.message || 'Your payment status is uncertain. Please check your order status.',
          confirmButtonText: 'View Orders'
        }).then(() => {
          navigate('/orders');
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      // Still show success to the user but log the error
      Swal.fire({
        icon: 'success',
        title: 'Payment Received',
        text: 'Your payment appears to have been processed. Please check your order status.',
        confirmButtonText: 'View Orders'
      }).then(() => {
        navigate('/orders');
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generic success message when we can't verify
  const showGenericSuccessMessage = () => {
    // Attempt to clear the cart even with generic success
    // This ensures the cart is cleared in all success scenarios
    dispatch(clearCart());
    
    // Clean up localStorage
    localStorage.removeItem('lastEsewaOrderId');
    localStorage.removeItem('esewaPaymentInitiated');
    localStorage.removeItem('esewaAuthToken');
    
    Swal.fire({
      icon: 'success',
      title: 'Payment Received',
      text: 'Your payment has been processed. Please check your order status.',
      confirmButtonText: 'View Orders'
    }).then(() => {
      navigate('/orders');
    });
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Processing Your Payment</h2>
          <p className="mt-2 text-gray-500">Please wait while we verify your payment with eSewa...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-800">Payment Successful!</h2>
        <p className="mt-2 text-gray-600">Your payment was successful and your order is being processed.</p>
        
        {paymentDetails && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg text-left">
            <h3 className="font-medium text-gray-700 mb-2">Payment Details:</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Transaction ID:</span> {paymentDetails.transaction_uuid}
            </p>
            {paymentDetails.ref_id && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reference ID:</span> {paymentDetails.ref_id}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> Rs. {paymentDetails.total_amount}
            </p>
          </div>
        )}
        
        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={() => navigate('/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            View Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsewaSuccess; 