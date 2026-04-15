const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const OrderStatusLog = require('../models/OrderStatusLog');

// @desc    Get orders filtered by seller's listings (No actual User document required)
// @route   GET /api/orders/incoming
const getIncomingOrders = async (req, res) => {
    try {
        // This ID comes from your mockAuth middleware. 
        // It's a real-looking ObjectId, but no User document actually exists for it.
        const sellerId = req.user.id; 

        // 1. Find listings tagged with this fake seller ID
        const sellerListings = await Listing.find({ seller_id: sellerId }).select('_id');
        const listingIds = sellerListings.map(listing => listing._id);

        // 2. Find orders tied ONLY to those listings
        const incomingOrders = await Order.find({ listing_id: { $in: listingIds } })
            .populate('listing_id', 'title price delivery_days image_urls')
            // NOTE: We DO NOT populate buyer_id here because the User model isn't ready.
            // It will just return the raw dummy ObjectId for now.
            .sort({ created_at: -1 });

        res.status(200).json(incomingOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching incoming orders', error: error.message });
    }
};

// @desc    Update order status with ownership check (No actual User document required)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { status } = req.body;
        const sellerId = req.user.id;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const order = await Order.findById(orderId).populate('listing_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security check: This string comparison works perfectly even if the User doesn't exist!
        if (order.listing_id.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.status = status;
        await order.save();

        const statusLog = new OrderStatusLog({
            order_id: order._id,
            status: status
        });
        await statusLog.save();

        res.status(200).json({
            message: 'Order status updated successfully',
            order,
            statusLog
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};


module.exports = {
    getIncomingOrders,
    updateOrderStatus
};