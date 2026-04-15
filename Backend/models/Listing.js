const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
        seller_id: {
            type: mongoose.Schema.CustomTypes ? mongoose.Schema.Types.ObjectId : mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        delivery_days: {
            type: Number,
            required: true,
        },
        image_urls: [
            {
            type: String,
            },
        ],
        is_active: {
            type: Boolean,
            default: true,
        },
    
    },
    
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = mongoose.model('Listing', listingSchema);