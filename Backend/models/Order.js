const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
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
    status: {
        type: String,
        enum: ['pending','processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
        required: true,
    },
},
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = mongoose.model('Order', orderSchema);