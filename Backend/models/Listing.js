const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductCategory',
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
            default: "https://i.ibb.co/000000/default-image.jpg",
            },
        ],
        countInStock: {
            type: Number,
            default: 0,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        rating: { 
            type: Number, 
            default: 0 
        },
        serviceableAreas: [{
            region: { 
            type: String, 
            required: true 
            },
            fee: { 
            type: Number, 
            required: true, 
            default: 0 
            }
        }]
    
    },
    
    {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = mongoose.model('Listing', listingSchema);