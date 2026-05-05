const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Flag a buyer from a seller order view (toggle flag)
// @route   PUT /api/flags/:orderNumber/flag-buyer
const flagBuyer = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const sellerId = req.user.id;

        const order = await Order.findOne({ orderNumber }).populate('items.listing_id').populate('buyer_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if seller owns any of the items in this order
        const sellerOwnsOrder = order.items.some(item => 
            item.listing_id && item.listing_id.seller_id && item.listing_id.seller_id.toString() === sellerId
        );

        if (!sellerOwnsOrder) {
            return res.status(403).json({ message: 'Not authorized to flag this buyer' });
        }

        const buyer = await User.findById(order.buyer_id._id);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        const wasFlagged = order.sellerFlag;
        
        if (wasFlagged) {
            // Remove flag
            order.sellerFlag = false;
            buyer.flags = Math.max(0, buyer.flags - 1);
        } else {
            // Add flag
            order.sellerFlag = true;
            buyer.flags = (buyer.flags || 0) + 1;
        }

        await Promise.all([buyer.save(), order.save()]);

        res.status(200).json({
            message: wasFlagged ? 'Flag removed successfully' : 'Buyer flagged successfully',
            buyer: { username: buyer.username, flags: buyer.flags },
            order: { orderNumber: order.orderNumber, sellerFlag: order.sellerFlag }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error flagging buyer', error: error.message });
    }
};

// @desc    Flag a seller from a buyer order view (toggle flag)
// @route   PUT /api/flags/:orderNumber/flag-seller
const flagSeller = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const buyerId = req.user.id;

        const order = await Order.findOne({ orderNumber }).populate('items.listing_id').populate('seller_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyer_id.toString() !== buyerId) {
            return res.status(403).json({ message: 'Not authorized to flag this seller' });
        }

        const seller = await User.findById(order.seller_id._id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        const wasFlagged = order.buyerFlag;
        
        if (wasFlagged) {
            // Remove flag
            order.buyerFlag = false;
            seller.flags = Math.max(0, seller.flags - 1);
        } else {
            // Add flag
            order.buyerFlag = true;
            seller.flags = (seller.flags || 0) + 1;
        }

        await Promise.all([seller.save(), order.save()]);

        res.status(200).json({
            message: wasFlagged ? 'Flag removed successfully' : 'Seller flagged successfully',
            seller: { username: seller.username, flags: seller.flags },
            order: { orderNumber: order.orderNumber, buyerFlag: order.buyerFlag }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error flagging seller', error: error.message });
    }
};

module.exports = {
    flagBuyer,
    flagSeller
};