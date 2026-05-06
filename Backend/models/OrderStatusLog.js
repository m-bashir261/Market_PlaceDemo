const mongoose = require('mongoose');
const { ref } = require('node:process');

const orderStatusLogSchema = new mongoose.Schema(
{
    orderNumber: {
            type: String,
            ref: 'Order',
        },
    status: {
        type: String,
        enum: ['Pending','Processing', 'Shipped', 'Delivered', 'Cancelled'],
        required: true,
        },
    changed_at: {
        type: Date,
        default: Date.now,
    },
}
);

module.exports = mongoose.model('OrderStatusLog', orderStatusLogSchema);