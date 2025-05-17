const express = require('express');
const { createAOrder, getOrderByEmail, getAllOrders, updateOrderStatus, cancelOrder, processRefund, approveRefund, resetAllOrders } = require('./order.controller');

const router =  express.Router();

// create order endpoint
router.post("/", createAOrder);

// get orders by user email 
router.get("/email/:email", getOrderByEmail);

// get all orders - admin only
router.get("/", getAllOrders);

// update order status - admin only
router.put("/:id/status", updateOrderStatus);

// cancel order endpoint
router.put("/:id/cancel", cancelOrder);

// process refund endpoint
router.put("/:id/refund", processRefund);

// approve refund endpoint - admin only
router.put("/:id/approve-refund", approveRefund);

// reset all orders endpoint - admin only
router.delete("/reset", resetAllOrders);

module.exports = router;