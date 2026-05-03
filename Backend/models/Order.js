const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },

        buyer_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        items: [
            {
                listing_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Listing',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            default: 0,
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

// Auto-generate ORD-001, ORD-002, etc.
orderSchema.pre('save', async function() {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(3, '0')}`;
    }
    
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;