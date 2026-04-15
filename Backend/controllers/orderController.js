const Order = require('../models/Order');


// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { listing_id } = req.body;

    
    const buyer_id = req.user?.id || '000000000000000000000001';

    if (!listing_id) {
      return res.status(400).json({ message: 'listing_id is required' });
    }

    const order = await Order.create({
      buyer_id,
      listing_id,
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
    const buyer_id = req.user?.id || '000000000000000000000001';

    const orders = await Order.find({ buyer_id })
      .populate('listing_id')   
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
    const order = await Order.findById(req.params.id).populate('listing_id');

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