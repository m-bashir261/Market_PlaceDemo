const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const OrderStatusLog = require('../models/OrderStatusLog');

/**
 * @desc    Get orders for a seller (filtered by seller_id in orders where seller_id matches the authenticated user)
 * @route   GET /api/orders/incoming
 * @access  Private
 */
const getIncomingOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Validate sellerId
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }

        // 1. Find listings tagged with this seller ID
        const sellerListings = await Listing.find({ seller_id: sellerId }).select('_id');
        const listingIds = sellerListings.map(listing => listing._id);

        // 2. Find orders tied ONLY to those listings
        const incomingOrders = await Order.find({ 'items.listing_id': { $in: listingIds } })
            .populate('items.listing_id', 'title items.price delivery_days image_urls')
            .populate('buyer_id', 'firstName lastName username')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            count: incomingOrders.length,
            message: `Found ${incomingOrders.length} order(s)`,
            orders: incomingOrders
        });
    } catch (error) {
        console.error('getIncomingOrders error:', error);
        res.status(500).json({ message: 'Error fetching incoming orders', error: error.message });
    }
};

/**
 * @desc    Get order stats for a seller (total orders, pending orders, etc.)
 * @route   GET /api/orders/seller/stats
 * @access  Private
 */
const getSellerOrderStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }

        const stats = await Order.aggregate([
            { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments({ seller_id: sellerId });
        const totalRevenue = await Order.aggregate([
            { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            success: true,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusBreakdown: stats
        });
    } catch (error) {
        console.error('getSellerOrderStats error:', error);
        res.status(500).json({ message: 'Error fetching order stats', error: error.message });
    }
};

/**
 * @desc    Update order status (seller updates status of their orders)
 * @route   PUT /api/orders/:orderNumber/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { status } = req.body;
        const sellerId = req.user.id;

        // Validate status
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status provided',
                validStatuses 
            });
        }

        // Find order
        const order = await Order.findOne({ orderNumber });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security check - ensure seller owns this order
        if (order.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // Update order status
        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Log status change
        const statusLog = new OrderStatusLog({
            orderNumber: order.orderNumber,
            status: status,
            previousStatus: oldStatus,
            changedAt: new Date()
        });
        await statusLog.save();

        // Populate before sending response
        await order.populate('seller_id', 'username email name');
        await order.populate('buyer_id', 'firstName lastName email phone');
        await order.populate('items.listing_id', 'title price image_urls');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order,
            statusLog
        });
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

/**
 * @desc    Get a single order for seller (with authorization check)
 * @route   GET /api/orders/seller/:orderId
 * @access  Private
 */
const getSellerOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId)
            .populate('items.listing_id', 'title price delivery_days image_urls')
            .populate('buyer_id', 'firstName lastName email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if seller owns this order
        if (order.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('getSellerOrder error:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

module.exports = {
    getIncomingOrders,
    getSellerOrderStats,
    updateOrderStatus,
    getSellerOrder
};