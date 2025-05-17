import React, { useEffect, useState, useRef } from 'react';
import { useInitiateEsewaPaymentMutation } from '../../redux/features/payments/esewaApi';
import Swal from 'sweetalert2';

const EsewaPayment = ({ orderId }) => {
  const [initiatePayment, { isLoading, isError, error }] = useInitiateEsewaPaymentMutation();
  const [paymentData, setPaymentData] = useState(null);
  const formRef = useRef(null);
  
  // Initiate the eSewa payment process
  useEffect(() => {
    if (orderId) {
      handleInitiatePayment();
    }
  }, [orderId]);
  
  // Automatically submit the form when payment data is loaded
  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);
  
  // Handle payment initiation
  const handleInitiatePayment = async () => {
    try {
      const response = await initiatePayment(orderId).unwrap();
      if (response.success && response.paymentData) {
        // Store the order ID and authentication info in localStorage before redirecting to eSewa
        localStorage.setItem('lastEsewaOrderId', orderId);
        localStorage.setItem('esewaPaymentInitiated', new Date().toISOString());
        
        // Store the current auth token to restore after payment
        const authToken = localStorage.getItem('token');
        if (authToken) {
          localStorage.setItem('esewaAuthToken', authToken);
        }
        
        setPaymentData(response.paymentData);
      } else {
        showError('Failed to initiate payment with eSewa.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      showError(err?.data?.message || 'There was an error connecting to eSewa payment services.');
    }
  };
  
  // Show error message
  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Payment Error',
      text: message,
      confirmButtonText: 'Try Again'
    });
  };
  
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connecting to eSewa payment gateway...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p className="font-bold">Payment Error</p>
          <p>{error?.data?.message || 'Failed to connect to eSewa payment services.'}</p>
        </div>
        <button 
          onClick={handleInitiatePayment}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      {paymentData ? (
        <div>
          <p className="mb-4">You will be redirected to the eSewa payment page...</p>
          
          {/* Hidden form for eSewa payment submission */}
          <form 
            ref={formRef}
            action={paymentData.payment_url} 
            method="POST" 
            className="hidden"
          >
            <input type="text" name="amount" value={paymentData.amount} readOnly />
            <input type="text" name="tax_amount" value={paymentData.tax_amount} readOnly />
            <input type="text" name="total_amount" value={paymentData.total_amount} readOnly />
            <input type="text" name="transaction_uuid" value={paymentData.transaction_uuid} readOnly />
            <input type="text" name="product_code" value={paymentData.product_code} readOnly />
            <input type="text" name="product_service_charge" value={paymentData.product_service_charge} readOnly />
            <input type="text" name="product_delivery_charge" value={paymentData.product_delivery_charge} readOnly />
            <input type="text" name="success_url" value={paymentData.success_url} readOnly />
            <input type="text" name="failure_url" value={paymentData.failure_url} readOnly />
            <input type="text" name="signed_field_names" value={paymentData.signed_field_names} readOnly />
            <input type="text" name="signature" value={paymentData.signature} readOnly />
            <button type="submit">Pay with eSewa</button>
          </form>
          
          {/* Loading indicator while form submits */}
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Redirecting to eSewa...</p>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleInitiatePayment}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <span className="text-xl">eSewa</span>
          <span>Pay Now</span>
        </button>
      )}
    </div>
  );
};

export default EsewaPayment; 