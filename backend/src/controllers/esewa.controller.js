const esewaService = require('../utils/esewa.service');
const Order = require('../orders/order.model');

/* Controller for eSewa payment gateway integration */

/** 

 * Initializes an eSewa payment for a given order
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 
**/
const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Fetch order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Define success and failure callback URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/payment/esewa/success`;
    const failureUrl = `${baseUrl}/payment/esewa/failure`;
    
    // Generate eSewa payment request parameters
    const paymentRequest = esewaService.createPaymentRequest(order, successUrl, failureUrl);
    
    // Add payment reference to order
    order.paymentMethod = "eSewa";
    order.paymentReference = {
      method: "eSewa",
      transactionId: order._id.toString(),
      status: "initiated"
    };
    await order.save();
    
    res.status(200).json({ 
      success: true, 
      paymentData: paymentRequest 
    });
  } catch (error) {
    console.error("Error initiating eSewa payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to initiate payment", 
      error: error.message 
    });
  }
};

/**
 * Verifies eSewa payment response
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const verifyEsewaPayment = async (req, res) => {
  try {
    // Extract the payment response data
    const paymentResponse = req.body;
    console.log('Received payment verification request with data:', paymentResponse);
    
    // Verify the signature
    console.log('Starting signature verification...');
    const isValid = esewaService.verifyPaymentResponse(paymentResponse);
    console.log('Signature verification result:', isValid);
    
    if (!isValid) {
      console.log('Signature verification failed');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }
    
    // Extract transaction data
    const { transaction_uuid, status, total_amount, product_code, ref_id } = paymentResponse;
    console.log('Extracted transaction data:', { transaction_uuid, status, total_amount, product_code, ref_id });
    
    // Find the order
    console.log('Looking for order with ID:', transaction_uuid);
    
    // Validate transaction_uuid is a valid MongoDB ObjectID
    if (!transaction_uuid || !transaction_uuid.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid transaction_uuid format:', transaction_uuid);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid transaction ID format" 
      });
    }
    
    try {
      const order = await Order.findById(transaction_uuid);
      if (!order) {
        console.log('Order not found with ID:', transaction_uuid);
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }
      
      console.log('Found order:', order);
      
      // Update order with payment status and reference ID
      if (status === "COMPLETE") {
        order.status = "processing"; // Change from pending to processing
        order.paymentMethod = "eSewa";
        order.paymentReference = {
          method: "eSewa",
          transactionId: transaction_uuid,
          referenceId: ref_id,
          status: "completed",
          completedAt: new Date()
        };
        await order.save();
        
        return res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          order
        });
      } else {
        // Payment failed or is in another state
        order.paymentReference = {
          method: "eSewa",
          transactionId: transaction_uuid,
          referenceId: ref_id,
          status: status.toLowerCase(),
          updatedAt: new Date()
        };
        await order.save();
        
        return res.status(200).json({
          success: false,
          message: `Payment ${status.toLowerCase()}`,
          order
        });
      }
    } catch (error) {
      console.error("Error finding or updating order:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing order after payment", 
        error: error.message 
      });
    }
  } catch (error) {
    console.error("Error verifying eSewa payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify payment", 
      error: error.message 
    });
  }
};

/**
 * Checks the status of an eSewa payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const checkEsewaPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Fetch order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get payment parameters from order
    const product_code = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const transaction_uuid = order._id.toString();
    const total_amount = order.totalPrice;
    
    // Check payment status with eSewa
    const statusResponse = await esewaService.checkPaymentStatus(
      product_code,
      transaction_uuid,
      total_amount
    );
    
    // Update order with latest status
    if (statusResponse.status) {
      order.paymentReference = {
        ...(order.paymentReference || {}),
        status: statusResponse.status.toLowerCase(),
        referenceId: statusResponse.ref_id || order.paymentReference?.referenceId,
        updatedAt: new Date()
      };
      
      // If payment is complete, update order status
      if (statusResponse.status === "COMPLETE") {
        order.status = "processing";
      }
      
      await order.save();
    }
    
    res.status(200).json({ 
      success: true, 
      paymentStatus: statusResponse,
      order
    });
  } catch (error) {
    console.error("Error checking eSewa payment status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check payment status", 
      error: error.message 
    });
  }
};

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  checkEsewaPaymentStatus
}; 