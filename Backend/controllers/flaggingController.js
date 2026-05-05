const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Flag a buyer as good or bad from a seller order view
// @route   PUT /api/orders/:orderNumber/flag
const flagBuyer = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { flag } = req.body;
        const sellerId = req.user.id;

        if (!['good', 'bad'].includes(flag)) {
            return res.status(400).json({ message: 'Invalid flag value' });
        }

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

        const previousFlag = order.sellerFlag;
        if (flag === previousFlag) {
            // If the seller clicks the same vote again, remove the vote entirely.
            const buyer = await User.findById(order.buyer_id._id);
            if (!buyer) {
                return res.status(404).json({ message: 'Buyer not found' });
            }

            if (previousFlag === 'good') {
                buyer.upVotes = Math.max(0, buyer.upVotes - 1);
            } else if (previousFlag === 'bad') {
                buyer.downVotes = Math.max(0, buyer.downVotes - 1);
            }

            order.sellerFlag = null;
            await Promise.all([buyer.save(), order.save()]);

            return res.status(200).json({
                message: 'Buyer flag removed successfully',
                buyer: { username: buyer.username, upVotes: buyer.upVotes, downVotes: buyer.downVotes },
                order: { orderNumber: order.orderNumber, sellerFlag: order.sellerFlag }
            });
        }

        const buyer = await User.findById(order.buyer_id._id);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        if (previousFlag === 'good') {
            buyer.upVotes = Math.max(0, buyer.upVotes - 1);
        } else if (previousFlag === 'bad') {
            buyer.downVotes = Math.max(0, buyer.downVotes - 1);
        }

        if (flag === 'good') {
            buyer.upVotes += 1;
        } else if (flag === 'bad') {
            buyer.downVotes += 1;
        }

        order.sellerFlag = flag;

        await Promise.all([buyer.save(), order.save()]);

        res.status(200).json({
            message: 'Buyer flag updated successfully',
            buyer: { username: buyer.username, upVotes: buyer.upVotes, downVotes: buyer.downVotes },
            order: { orderNumber: order.orderNumber, sellerFlag: order.sellerFlag }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error flagging buyer', error: error.message });
    }
};

// @desc    Flag a seller as good or bad from a buyer order view
// @route   PUT /api/orders/:orderNumber/flag-seller
const flagSeller = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { flag } = req.body;
        const buyerId = req.user.id;

        if (!['good', 'bad'].includes(flag)) {
            return res.status(400).json({ message: 'Invalid flag value' });
        }

        const order = await Order.findOne({ orderNumber }).populate('items.listing_id').populate('seller_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyer_id.toString() !== buyerId) {
            return res.status(403).json({ message: 'Not authorized to flag this seller' });
        }

        const previousFlag = order.buyerFlag;
        if (flag === previousFlag) {
            // If the seller clicks the same vote again, remove the vote entirely.
            const seller = await User.findById(order.seller_id._id);
            if (!seller) {
                return res.status(404).json({ message: 'Seller not found' });
            }

            if (previousFlag === 'good') {
                seller.upVotes = Math.max(0, seller.upVotes - 1);
            } else if (previousFlag === 'bad') {
                seller.downVotes = Math.max(0, seller.downVotes - 1);
            }

            order.sellerFlag = null;
            await Promise.all([seller.save(), order.save()]);

            return res.status(200).json({
                message: 'Seller flag removed successfully',
                seller: { username: seller.username, upVotes: seller.upVotes, downVotes: seller.downVotes },
                order: { orderNumber: order.orderNumber, sellerFlag: order.sellerFlag }
            });
        }

        const seller = await User.findById(order.seller_id._id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        if (previousFlag === 'good') {
            seller.upVotes = Math.max(0, seller.upVotes - 1);
        } else if (previousFlag === 'bad') {
            seller.downVotes = Math.max(0, seller.downVotes - 1);
        }

        if (flag === 'good') {
            seller.upVotes += 1;
        } else if (flag === 'bad') {
            seller.downVotes += 1;
        }

        order.sellerFlag = flag;

        await Promise.all([seller.save(), order.save()]);

        res.status(200).json({
            message: 'Seller flag updated successfully',
            seller: { username: seller.username, upVotes: seller.upVotes, downVotes: seller.downVotes },
            order: { orderNumber: order.orderNumber, sellerFlag: order.sellerFlag }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error flagging seller', error: error.message });
    }
};

module.exports = {
    flagBuyer,
    flagSeller
};