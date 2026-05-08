const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { sendOrderConfirmation } = require('../emailService');


// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { seller_id, items, totalAmount, shippingDetails } = req.body;
    const buyer_id = req.user.id;

    // Validation
    if (!seller_id) {
      return res.status(400).json({ message: 'seller_id is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items array is required and must not be empty' });
    }

    if (!shippingDetails) {
      return res.status(400).json({ message: 'shippingDetails are required' });
    }

    if (!shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.email || 
        !shippingDetails.phone || !shippingDetails.addressLine1 || !shippingDetails.city || 
        !shippingDetails.state || !shippingDetails.postalCode) {
      return res.status(400).json({ message: 'All shipping details are required' });
    }

    // Validate that all items belong to the same seller
    const listingIds = items.map(item => item.listing_id);
    const listings = await Listing.find({ _id: { $in: listingIds } });

    const sellerIdFromListings = listings[0]?.seller_id.toString();
    
    if (!sellerIdFromListings || listings.some(l => l.seller_id.toString() !== sellerIdFromListings)) {
      return res.status(400).json({ message: 'All items must be from the same seller' });
    }

    if (sellerIdFromListings !== seller_id) {
      return res.status(400).json({ message: 'seller_id does not match the listings' });
    }

    // 1. Verify stock for all items before creating the order
    const listingsToUpdate = [];
    for (const item of items) {
      const listing = listings.find(l => l._id.toString() === item.listing_id);
      
      if (!listing) {
        return res.status(404).json({ message: `Product not found` });
      }

      // Check if requested quantity exceeds available stock
      if (listing.countInStock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${listing.title}. Only ${listing.countInStock} left.` 
        });
      }

      // 2. Deduct the stock
      listing.countInStock -= item.quantity;
      listingsToUpdate.push(listing);
    }

    // 3. Save all the updated listings back to the database
    await Promise.all(listingsToUpdate.map(listing => listing.save()));

    // Create order
    const order = await Order.create({
      buyer_id,
      seller_id,
      items,
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingDetails,
    });

    // Populate references before sending response
    await order.populate('seller_id', 'username email name');
    await order.populate('buyer_id', 'username email name');
    await order.populate('items.listing_id', 'title price image_urls');

    // ✅ Send confirmation email (non-blocking)
    sendOrderConfirmation(
        order,
        shippingDetails.email || req.user.email,
        `${shippingDetails.firstName} ${shippingDetails.lastName}`
    ).catch(err => console.error('Email send failed (non-blocking):', err.message));


    res.status(201).json({
      message: 'Order placed successfully',
      order,
      orderNumber: order.orderNumber
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

    let orders = await Order.find({ buyer_id })
      .populate('items.listing_id', 'title price image_urls')
      .populate('seller_id', 'username name email')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all reviews made by this buyer
    const userReviews = await Review.find({ buyer_id: req.user.id });
    
    // Create an array or Set of order IDs that have been reviewed
    const reviewedOrderIds = userReviews.map(r => r.order_id.toString());

    orders = orders.map(order => {
        return {
            ...order,
            items: (order.items || []).map(item => {
                const listingId = item.listing_id?._id || item.listing_id;
                const review = userReviews.find(
                    r => r.order_id.toString() === order._id.toString() &&
                          r.listing_id.toString() === listingId.toString()
                );
                return {
                    ...item,
                    review: review || null
                };
            })
        };
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

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

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);

  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders for a specific seller (only shows orders for their products)
const getSellerOrders = async (req, res) => {
  try {
    const seller_id = req.user.id;

    const orders = await Order.find({ seller_id })
      .populate('items.listing_id', 'title price image_urls')
      .populate('buyer_id', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('getSellerOrders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { placeOrder, getBuyerOrders, getOrderById, getSellerOrders };