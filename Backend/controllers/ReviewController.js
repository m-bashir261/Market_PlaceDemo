const Review = require('../models/Review');
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// POST /api/reviews
const submitReview = async (req, res) => {
    try {
        const { order_id, listing_id, rating, comment } = req.body;
        const buyer_id = req.user.id;

        // 1. Verify order exists and belongs to this buyer
        const order = await Order.findById(order_id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.buyer_id.toString() !== buyer_id) {
            return res.status(403).json({ message: 'Not authorized, this is not your order' });
        }

        // 2. Verify order is delivered
        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: 'You can only review delivered orders' });
        }

        // 3. Check if already reviewed
        const existing = await Review.findOne({ order_id, listing_id });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }

        // 4. Save review
        const review = await Review.create({ buyer_id, listing_id, order_id, rating, comment });

        // 5. Recalculate listing average rating
        const allReviews = await Review.find({ listing_id });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Listing.findByIdAndUpdate(listing_id, { rating: avgRating.toFixed(1) });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reviews/listing/:listingId
const getListingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ listing_id: req.params.listingId })
            .populate('buyer_id', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/reviews/:id
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.buyer_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized, this is not your review' });

        const { rating, comment } = req.body;
        review.rating = rating ?? review.rating;
        review.comment = comment ?? review.comment;
        await review.save();

        // Recalculate listing rating
        const allReviews = await Review.find({ listing_id: review.listing_id });
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Listing.findByIdAndUpdate(review.listing_id, { rating: avg.toFixed(1) });

        res.status(200).json({ message: 'Review updated', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.buyer_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized, this is not your review' });

        const listing_id = review.listing_id;
        await Review.findByIdAndDelete(req.params.id);

        // Recalculate listing rating
        const allReviews = await Review.find({ listing_id });
        const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
        await Listing.findByIdAndUpdate(listing_id, { rating: avg.toFixed(1) });

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { submitReview, getListingReviews, updateReview, deleteReview };