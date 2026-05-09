const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { sendOrderConfirmation } = require('../emailService');


// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { seller_id, items, totalAmount, shippingDetails } = req.body;
    const buyer_id = req.user.id;

    if (!seller_id) return res.status(400).json({ message: 'seller_id is required' });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'items array is required and must not be empty' });
    if (!shippingDetails) return res.status(400).json({ message: 'shippingDetails are required' });
    if (!shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.email ||
        !shippingDetails.phone || !shippingDetails.addressLine1 || !shippingDetails.city ||
        !shippingDetails.state || !shippingDetails.postalCode)
      return res.status(400).json({ message: 'All shipping details are required' });

    const listingIds = items.map(item => item.listing_id);
    const listings = await Listing.find({ _id: { $in: listingIds } });

    const sellerIdFromListings = listings[0]?.seller_id.toString();
    if (!sellerIdFromListings || listings.some(l => l.seller_id.toString() !== sellerIdFromListings))
      return res.status(400).json({ message: 'All items must be from the same seller' });
    if (sellerIdFromListings !== seller_id)
      return res.status(400).json({ message: 'seller_id does not match the listings' });

    const listingsToUpdate = [];
    for (const item of items) {
      const listing = listings.find(l => l._id.toString() === item.listing_id);
      if (!listing) return res.status(404).json({ message: `Product not found` });
      if (listing.countInStock < item.quantity)
        return res.status(400).json({ message: `Not enough stock for ${listing.title}. Only ${listing.countInStock} left.` });
      listing.countInStock -= item.quantity;
      listingsToUpdate.push(listing);
    }

    await Promise.all(listingsToUpdate.map(listing => listing.save()));

    const order = await Order.create({
      buyer_id, seller_id, items,
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingDetails,
    });

    await order.populate('seller_id', 'username email name');
    await order.populate('buyer_id', 'username email name');
    await order.populate('items.listing_id', 'title price image_urls');

    sendOrderConfirmation(
      order,
      shippingDetails.email || req.user.email,
      `${shippingDetails.firstName} ${shippingDetails.lastName}`
    ).catch(err => console.error('Email send failed (non-blocking):', err.message));

    res.status(201).json({ message: 'Order placed successfully', order, orderNumber: order.orderNumber });
  } catch (error) {
    console.error('placeOrder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders for the logged-in buyer
const getBuyerOrders = async (req, res) => {
  try {
    const buyer_id = req.user.id;

    let orders = await Order.find({ buyer_id })
      .populate('items.listing_id', 'title price image_urls')
      .populate('seller_id', 'username name email')
      .sort({ createdAt: -1 })
      .lean();

    const userReviews = await Review.find({ buyer_id: req.user.id });
    const reviewedOrderIds = userReviews.map(r => r.order_id.toString());

    orders = orders.map(order => ({
      ...order,
      items: (order.items || []).map(item => {
        const listingId = item.listing_id?._id || item.listing_id;
        const review = userReviews.find(
          r => r.order_id.toString() === order._id.toString() &&
               r.listing_id.toString() === listingId.toString()
        );
        return { ...item, review: review || null };
      })
    }));

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('getBuyerOrders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.listing_id', 'title price image_urls')
      .populate('seller_id', 'username name email')
      .populate('buyer_id', 'firstName lastName email phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders for a specific seller
const getSellerOrders = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const orders = await Order.find({ seller_id })
      .populate('items.listing_id', 'title price image_urls')
      .populate('buyer_id', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('getSellerOrders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── TASK 1: Cancel an order (buyer only) ──────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: only the buyer who placed this order can cancel it
    if (order.buyer_id.toString() !== buyerId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    // Business rule: only Pending or Processing orders can be cancelled
    const cancellableStatuses = ['Pending', 'Processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel an order with status "${order.status}". Only Pending or Processing orders can be cancelled.`
      });
    }

    // Restore stock for each item
    const restorePromises = order.items.map(async (item) => {
      await Listing.findByIdAndUpdate(
        item.listing_id,
        { $inc: { countInStock: item.quantity } }
      );
    });
    await Promise.all(restorePromises);

    order.status = 'Cancelled';
    await order.save();

    await order.populate('items.listing_id', 'title price image_urls');
    await order.populate('seller_id', 'username');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('cancelOrder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { placeOrder, getBuyerOrders, getOrderById, getSellerOrders, cancelOrder };