const mongoose = require('mongoose');

const orderStatusLogSchema = new mongoose.Schema(
{
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending','processing', 'shipped', 'delivered', 'cancelled'],
        required: true,
        },
    changed_at: {
        type: Date,
        default: Date.now,
    },
}
);

module.exports = mongoose.model('OrderStatusLog', orderStatusLogSchema);