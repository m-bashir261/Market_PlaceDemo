const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toString(),
        },

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
        collection: 'orders_order'
    }

);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;