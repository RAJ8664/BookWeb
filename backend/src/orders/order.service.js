const Order = require("./order.model");

/**
 * Service layer for order management
 * Handles business logic separate from controllers
 */

// Create a new order
const createOrder = async (orderData) => {
  try {
    // Validate the order data
    if (!orderData.email || !orderData.products || !orderData.totalPrice) {
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
    
    return await Order.find({ email }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Get all orders
const getAllOrders = async () => {
  try {
    return await Order.find().sort({ createdAt: -1 });
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
    
    // Can only cancel pending orders
    if (order.status !== "pending") {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }
    
    order.status = "cancelled";
    order.cancelledAt = new Date();
    
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
    
    // Can only refund delivered orders
    if (order.status !== "delivered" && order.status !== "shipped") {
      throw new Error(`Cannot refund order with status: ${order.status}`);
    }
    
    order.status = "refunded";
    order.refundReason = refundReason;
    order.refundedAt = new Date();
    
    return await order.save();
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
  processRefund
}; 