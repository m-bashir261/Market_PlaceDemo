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

        const incomingOrders = await Order.find({ seller_id: sellerId })
            .populate('items.listing_id', 'title price delivery_days image_urls')
            .populate('buyer_id', 'firstName lastName username')
            .sort({ created_at: -1 });

        res.status(200).json(incomingOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching incoming orders', error: error.message });
    }
};

// @desc    Update order status with ownership check (No actual User document required)
// @route   PUT /api/orders/:orderNumber/status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { status } = req.body;
        const sellerId = req.user.id;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const order = await Order.findOne({ orderNumber });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security check
        if (order.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.status = status;
        await order.save();

        const statusLog = new OrderStatusLog({
            orderNumber: order.orderNumber,
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