const express = require('express');
const { 
  initiateEsewaPayment, 
  verifyEsewaPayment, 
  checkEsewaPaymentStatus 
} = require('../controllers/esewa.controller');

const router = express.Router();

// Route to initiate eSewa payment for an order
router.post('/initiate/:orderId', initiateEsewaPayment);

// Route to verify eSewa payment response
router.post('/verify', verifyEsewaPayment);

// Route to check eSewa payment status
router.get('/status/:orderId', checkEsewaPaymentStatus);

module.exports = router; 