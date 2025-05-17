const Order = require("./order.model");

/**
 * Service layer for order management
 * Handles business logic separate from controllers
 */

// Create a new order
const createOrder = async (orderData) => {
  try {
    // Validate the order data
    if (!orderData.email || !orderData.totalPrice) {
      throw new Error("Missing required order information");
    }

    // Ensure totalPrice is a number
    const parsedTotalPrice = parseFloat(orderData.totalPrice);
    if (isNaN(parsedTotalPrice)) {
      throw new Error("Invalid totalPrice value. Must be a valid number.");
    }

    // Create with validated data
    const newOrder = new Order({
      ...orderData,
      totalPrice: parsedTotalPrice,
      status: orderData.status || "pending" // Default status
    });

    return await newOrder.save();
  } catch (error) {
    throw error;
  }
};

// Get orders by email
const getOrdersByEmail = async (email) => {
  try {
    if (!email) {
      throw new Error("Email is required");
    }
    
    return await Order.find({ email })
      .populate('productIds', 'title price coverImage') // Keep this for backward compatibility
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Get all orders
const getAllOrders = async () => {
  try {
    return await Order.find()
      .populate('productIds', 'title price coverImage') // Keep this for backward compatibility
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    if (!status) {
      throw new Error("Status is required");
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    order.status = status;
    return await order.save();
  } catch (error) {
    throw error;
  }
};

// Cancel an order
const cancelOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Can only cancel if not yet shipped
    if (order.status === "shipped" || order.status === "delivered") {
      throw new Error("Cannot cancel order that has already been shipped or delivered");
    }
    
    // Mark order as cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    
    // If payment was through eSewa, mark for refund processing
    if (order.paymentMethod === "eSewa") {
      // Update payment reference to indicate refund is needed
      if (order.paymentReference) {
        order.paymentReference.status = "refunded";
        order.paymentReference.updatedAt = new Date();
      }
      // Add a note about refund processing
      order.refundReason = "Order cancelled by customer";
      order.refundedAt = new Date();
    }
    // If Cash on Delivery, no refund processing needed
    
    return await order.save();
  } catch (error) {
    throw error;
  }
};

// Process refund for an order
const processRefund = async (orderId, refundReason) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Can only refund cancelled orders
    if (order.status !== "cancelled") {
      throw new Error(`Cannot refund order with status: ${order.status}. Only cancelled orders can be refunded.`);
    }
    
    // Can only refund orders with online payment methods
    if (order.paymentMethod === "Cash on Delivery") {
      throw new Error("Cannot refund Cash on Delivery orders. Refunds are only available for online payment methods.");
    }
    
    // Set status to refund_processing - only admin can set to refunded
    order.status = "refund_processing";
    order.refundReason = refundReason;
    
    return await order.save();
  } catch (error) {
    throw error;
  }
};

// Approve refund for an order (admin only)
const approveRefund = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Can only approve refunds for orders in refund_processing status
    if (order.status !== "refund_processing") {
      throw new Error(`Cannot approve refund for order with status: ${order.status}. Only orders in refund_processing can be approved.`);
    }
    
    order.status = "refunded";
    order.refundedAt = new Date();
    
    return await order.save();
  } catch (error) {
    throw error;
  }
};

// Reset all orders (admin only)
const resetAllOrders = async () => {
  try {
    // Delete all orders from the database
    const result = await Order.deleteMany({});
    
    return {
      success: true,
      message: `Successfully deleted ${result.deletedCount} orders.`,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrdersByEmail,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  approveRefund,
  resetAllOrders
}; 