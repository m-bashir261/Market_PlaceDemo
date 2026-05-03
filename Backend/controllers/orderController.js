const Order = require('../models/Order');


// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { seller_id, items, totalAmount } = req.body;

    const buyer_id = req.user.id;

    if (!seller_id || !items || !items.length) {
      return res.status(400).json({ message: 'seller_id and items array are required' });
    }

    const order = await Order.create({
      buyer_id,
      seller_id,
      items,
      totalAmount,
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('placeOrder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders for the logged-in buyer
const getBuyerOrders = async (req, res) => {
  try {
    const buyer_id = req.user.id;

    const orders = await Order.find({ buyer_id })
      .populate('items.listing_id')
      .populate('seller_id', 'username name')
      .sort({ createdAt: -1 }); 

    res.status(200).json(orders);
  } catch (error) {
    console.error('getBuyerOrders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.listing_id')
      .populate('seller_id', 'username name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { placeOrder, getBuyerOrders, getOrderById };