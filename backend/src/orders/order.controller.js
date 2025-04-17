const Order = require("./order.model");
const Swal = require("sweetalert2");

const createAOrder = async (req, res) => {
  try {
    // Ensure totalPrice is a number
    const orderData = {
      ...req.body,
      totalPrice: parseFloat(req.body.totalPrice)
    };
    
    // Validate that totalPrice is a valid number
    if (isNaN(orderData.totalPrice)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Price",
        text: "Total price must be a valid number."
      });
      return res.status(400).json({ 
        message: "Invalid totalPrice value. Must be a valid number.",
        receivedValue: req.body.totalPrice
      });
    }
    
    console.log("Creating order with data:", orderData);
    
    const newOrder = await Order(orderData);
    const savedOrder = await newOrder.save();
    
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
    const orders = await Order.find({email}).sort({createdAt: -1});
    if(!orders) {
      Swal.fire({
        icon: "warning",
        title: "No Orders Found",
        text: "We couldn't find any orders for this email."
      });
      return res.status(404).json({ message: "Order not found" });
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
    
    res.status(500).json({ message: "Failed to fetch order" });
  }
}

module.exports = {
  createAOrder,
  getOrderByEmail
};
