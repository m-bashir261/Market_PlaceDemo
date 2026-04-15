const express = require('express');
const router = express.Router();
const { getIncomingOrders, updateOrderStatus } = require('../controllers/OrderControllerSeller');
// const { protect } = require('../middleware/authMiddleware'); // Your auth middleware

// MOCK AUTH MIDDLEWARE: Pretend we are a logged-in seller
const mockAuth = (req, res, next) => {
    req.user = {
        id: '65f0a1b2c3d4e5f6a7b8c9d0' // A fake MongoDB ObjectId for our test seller
    };
    next();
};

// Route for sellers to view their incoming orders
router.get('/incoming', mockAuth, getIncomingOrders);

// Route for sellers to update an order's status
router.put('/:id/status', mockAuth, updateOrderStatus);


module.exports = router;