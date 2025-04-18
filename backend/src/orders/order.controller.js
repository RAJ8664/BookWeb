const Swal = require("sweetalert2");
const orderService = require("./order.service");

const createAOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Use the service layer to create the order
    const savedOrder = await orderService.createOrder(orderData);
    
    Swal.fire({
      icon: "success",
      title: "Order Created",
      text: "Your order has been successfully created!"
    });
    
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    
    Swal.fire({
      icon: "error",
      title: "Order Failed",
      text: "Failed to create your order. Please try again."
    });
    
    res.status(500).json({ 
      message: "Failed to create order",
      error: error.message
    });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const {email} = req.params;
    
    // Use the service layer to get orders by email
    const orders = await orderService.getOrdersByEmail(email);
    
    if(!orders.length) {
      Swal.fire({
        icon: "warning",
        title: "No Orders Found",
        text: "We couldn't find any orders for this email."
      });
      return res.status(404).json({ message: "No orders found" });
    }
    
    Swal.fire({
      icon: "info",
      title: "Orders Retrieved",
      text: `Found ${orders.length} orders for this email.`
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch your orders. Please try again later."
    });
    
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
}

const getAllOrders = async (req, res) => {
  try {
    // Use the service layer to get all orders
    const orders = await orderService.getAllOrders();
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Use the service layer to update order status
    const updatedOrder = await orderService.updateOrderStatus(id, status);
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status", error);
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
}

// New controller method for cancelling an order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use the service layer to cancel the order
    const cancelledOrder = await orderService.cancelOrder(id);
    
    Swal.fire({
      icon: "success",
      title: "Order Cancelled",
      text: "Your order has been successfully cancelled!"
    });
    
    res.status(200).json(cancelledOrder);
  } catch (error) {
    console.error("Error cancelling order", error);
    
    Swal.fire({
      icon: "error",
      title: "Cancellation Failed",
      text: error.message || "Failed to cancel your order. Please try again."
    });
    
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
}

// New controller method for processing refunds
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason } = req.body;
    
    if (!refundReason) {
      return res.status(400).json({ message: "Refund reason is required" });
    }
    
    // Use the service layer to process the refund
    const refundedOrder = await orderService.processRefund(id, refundReason);
    
    Swal.fire({
      icon: "success",
      title: "Refund Processed",
      text: "Your refund request has been processed!"
    });
    
    res.status(200).json(refundedOrder);
  } catch (error) {
    console.error("Error processing refund", error);
    
    Swal.fire({
      icon: "error",
      title: "Refund Failed",
      text: error.message || "Failed to process your refund request. Please try again."
    });
    
    res.status(500).json({ message: "Failed to process refund", error: error.message });
  }
}

module.exports = {
  createAOrder,
  getOrderByEmail,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund
};
