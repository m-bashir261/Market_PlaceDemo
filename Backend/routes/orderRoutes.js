const express = require('express');
const router = express.Router();
const { placeOrder, getBuyerOrders, getOrderById, getSellerOrders } = require('../controllers/orderController');
const { getIncomingOrders, updateOrderStatus, getSellerOrderStats, getSellerOrder } = require('../controllers/OrderControllerSeller');
const { protect } = require('../controllers/authController'); // Your auth middleware

// ====== ORDER PLACEMENT ======

// Place a new order (buyer)
router.post('/', protect, placeOrder);

// ====== BUYER ROUTES ======

// Get all orders for the buyer
router.get('/buyer/my-orders', protect, getBuyerOrders);

// ====== SELLER ROUTES (LEGACY & NEW) ======

// Route for sellers to view their incoming orders (legacy endpoint - kept for backward compatibility)
router.get('/incoming', protect, getIncomingOrders);

// Get all orders for a seller (new endpoint)
router.get('/seller/my-orders', protect, getSellerOrders);

// Get order stats for a seller
router.get('/seller/stats', protect, getSellerOrderStats);

// Get a single order for seller (with authorization check)
router.get('/seller/:orderId', protect, getSellerOrder);

// ====== GENERAL ROUTES ======

// Get a single order by ID (must be protected and come after seller routes to avoid conflicts)
router.get('/:id', protect, getOrderById);

// Route for sellers to update an order's status
router.put('/:orderNumber/status', protect, updateOrderStatus);

module.exports = router;