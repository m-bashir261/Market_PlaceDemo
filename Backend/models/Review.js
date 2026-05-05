const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        buyer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        listing_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ order_id: 1, listing_id: 1 }, { unique: true });


module.exports = mongoose.model('Review', reviewSchema);