const express = require('express');
const router = express.Router();
const { placeOrder, getBuyerOrders, getOrderById } = require('../controllers/orderController');

//place a new order
router.post('/', placeOrder);

//get all orders for the buyer
router.get('/', getBuyerOrders);

//get a single order by ID
router.get('/:id', getOrderById);

module.exports = router;