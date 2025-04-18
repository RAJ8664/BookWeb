const express = require('express');
const { createAOrder, getOrderByEmail, getAllOrders, updateOrderStatus, cancelOrder, processRefund } = require('./order.controller');

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

module.exports = router;