const crypto = require('crypto-js');
require('dotenv').config();

/**
 * eSewa Payment Service
 * Implements integration with eSewa payment gateway based on eSewa API documentation
 */

// Environment-specific configuration
const config = {
  // Production URLs
  PROD_FORM_URL: 'https://epay.esewa.com.np/api/epay/main/v2/form',
  PROD_STATUS_URL: 'https://epay.esewa.com.np/api/epay/transaction/status',
  
  // Testing/Development URLs
  TEST_FORM_URL: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  TEST_STATUS_URL: 'https://rc.esewa.com.np/api/epay/transaction/status',
  
  // eSewa merchant credentials
  MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  SECRET_KEY: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
};

/**
 * Generate HMAC/SHA256 signature for eSewa payment
 * @param {object} params - Payment parameters for signature generation
 * @param {number} params.total_amount - Total amount of the order
 * @param {string} params.transaction_uuid - Unique transaction identifier
 * @param {string} params.product_code - Merchant product code
 * @returns {string} Base64 encoded signature
 */
const generateSignature = (params) => {
  try {
    // Input should be a string with comma-separated values in correct order
    const signatureString = `total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`;
    
    // Generate HMAC-SHA256 hash and encode to base64
    const hmacSha256 = crypto.HmacSHA256(signatureString, config.SECRET_KEY);
    const signature = crypto.enc.Base64.stringify(hmacSha256);
    
    return signature;
  } catch (error) {
    console.error("Error generating eSewa signature:", error);
    throw new Error("Failed to generate payment signature");
  }
};

/**
 * Create eSewa payment request parameters
 * @param {object} order - Order information
 * @param {string} order._id - Order ID
 * @param {number} order.totalPrice - Total price of the order
 * @param {string} successUrl - Success callback URL
 * @param {string} failureUrl - Failure callback URL
 * @returns {object} eSewa payment request parameters
 */
const createPaymentRequest = (order, successUrl, failureUrl) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Calculate tax and amounts (assuming tax is included in totalPrice)
    const totalAmount = parseFloat(order.totalPrice);
    const taxAmount = totalAmount * 0.13; // 13% VAT (example - adjust as needed)
    const amount = totalAmount - taxAmount;
    
    // Payment parameters
    const paymentParams = {
      amount: amount.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      transaction_uuid: order._id.toString(),
      product_code: config.MERCHANT_ID,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };
    
    // Generate signature
    const signature = generateSignature({
      total_amount: paymentParams.total_amount,
      transaction_uuid: paymentParams.transaction_uuid,
      product_code: paymentParams.product_code
    });
    
    return {
      ...paymentParams,
      signature,
      payment_url: isProduction ? config.PROD_FORM_URL : config.TEST_FORM_URL
    };
  } catch (error) {
    console.error("Error creating eSewa payment request:", error);
    throw new Error("Failed to create payment request");
  }
};

/**
 * Check payment status with eSewa
 * @param {string} product_code - Merchant product code
 * @param {string} transaction_uuid - Unique transaction identifier
 * @param {number} total_amount - Total amount of the order
 * @returns {Promise<object>} Payment status response
 */
const checkPaymentStatus = async (product_code, transaction_uuid, total_amount) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const statusUrl = isProduction ? config.PROD_STATUS_URL : config.TEST_STATUS_URL;
    
    const url = `${statusUrl}/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`eSewa status check failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking eSewa payment status:", error);
    throw new Error("Failed to check payment status");
  }
};

/**
 * Verify eSewa payment response
 * @param {object} paymentResponse - Payment response from eSewa 
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentResponse = (paymentResponse) => {
  try {
    console.log('Starting eSewa payment response verification with data:', paymentResponse);
    
    // Check if response has all required fields
    if (!paymentResponse || !paymentResponse.signed_field_names || !paymentResponse.signature) {
      console.error('Missing required fields in payment response');
      console.error('signed_field_names present:', !!paymentResponse.signed_field_names);
      console.error('signature present:', !!paymentResponse.signature);
      return false;
    }
    
    // Extract parameters from payment response
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature: receivedSignature
    } = paymentResponse;
    
    console.log('Extracted fields for verification:', { 
      transaction_code, status, total_amount, 
      transaction_uuid, product_code, signed_field_names, 
      receivedSignature 
    });
    
    // Create signature string based on field names in signed_field_names
    const fields = signed_field_names.split(',');
    console.log('Fields to use for signature:', fields);
    
    // Important: verify that all fields specified in signed_field_names exist in paymentResponse
    const missingSignedFields = fields.filter(field => !paymentResponse.hasOwnProperty(field));
    if (missingSignedFields.length > 0) {
      console.error('Missing fields required for signature:', missingSignedFields);
      return false;
    }
    
    const signatureData = fields.map(field => `${field}=${paymentResponse[field]}`).join(',');
    console.log('Signature data string:', signatureData);
    console.log('Secret key used:', config.SECRET_KEY);
    
    // Generate signature for verification
    const hmacSha256 = crypto.HmacSHA256(signatureData, config.SECRET_KEY);
    const calculatedSignature = crypto.enc.Base64.stringify(hmacSha256);
    
    console.log('Calculated signature:', calculatedSignature);
    console.log('Received signature:', receivedSignature);
    console.log('Signatures match:', calculatedSignature === receivedSignature);
    
    // If signatures don't match, try alternate format (some eSewa responses have different formats)
    if (calculatedSignature !== receivedSignature) {
      console.log('Trying alternate signature format...');
      
      // Try with the exact original signature format from the payment request creation
      const alternateSignatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const alternateHmac = crypto.HmacSHA256(alternateSignatureString, config.SECRET_KEY);
      const alternateSignature = crypto.enc.Base64.stringify(alternateHmac);
      
      console.log('Alternate signature data:', alternateSignatureString);
      console.log('Alternate calculated signature:', alternateSignature);
      console.log('Alternate signatures match:', alternateSignature === receivedSignature);
      
      return alternateSignature === receivedSignature;
    }
    
    // Return original signature check result
    return calculatedSignature === receivedSignature;
  } catch (error) {
    console.error("Error verifying eSewa payment response:", error);
    return false;
  }
};

module.exports = {
  createPaymentRequest,
  checkPaymentStatus,
  verifyPaymentResponse
}; 