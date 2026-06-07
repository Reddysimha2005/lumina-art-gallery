const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, orderController.createOrder);
router.post('/verify', authMiddleware, orderController.verifyPayment);
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/razorpay-key', authMiddleware, orderController.getRazorpayKey);

module.exports = router;
