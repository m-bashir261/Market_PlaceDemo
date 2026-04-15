const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        buyer_id:{
            type: mongoose.Schema.Types.ObjectId, //forgein key
            ref: 'User',
            required: true,
        },

        listing_id:{
            type: mongoose.Schema.Types.ObjectId, //forgein key
            ref: 'Listing',
            required: true,
        },

        status:{
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    
    },
    
    {
        timestamps: true,
    }

);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;