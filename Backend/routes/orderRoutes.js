const express = require('express');
const router = express.Router();
const { placeOrder, getBuyerOrders, getOrderById, getSellerOrders, cancelOrder } = require('../controllers/orderController');
const { getIncomingOrders, updateOrderStatus, getSellerOrderStats, getSellerOrder } = require('../controllers/OrderControllerSeller');
const { protect } = require('../controllers/authController');

// ====== ORDER PLACEMENT ======
router.post('/', protect, placeOrder);

// ====== BUYER ROUTES ======
router.get('/buyer/my-orders', protect, getBuyerOrders);

// TASK 1: Cancel an order (buyer only) — must come before /:id
router.patch('/:id/cancel', protect, cancelOrder);

// ====== SELLER ROUTES ======
router.get('/incoming', protect, getIncomingOrders);
router.get('/seller/my-orders', protect, getSellerOrders);
router.get('/seller/stats', protect, getSellerOrderStats);
router.get('/seller/:orderId', protect, getSellerOrder);

// ====== GENERAL ROUTES ======
router.get('/:id', protect, getOrderById);
router.put('/:orderNumber/status', protect, updateOrderStatus);

module.exports = router;