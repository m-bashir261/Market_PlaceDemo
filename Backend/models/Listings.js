const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId, //foreign key relationship
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    delivery_days: {
        type: Number,
        required: true
    },
    image_url: {
        type: [String], //array of strings
        default: []
    },
}, {timestammps: true});

module.exports = mongoose.model('Listing', listingSchema);