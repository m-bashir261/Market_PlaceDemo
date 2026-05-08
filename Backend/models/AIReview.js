const mongoose = require('mongoose');

const ai_reviewSchema = new mongoose.Schema(
    {

        listing_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        last_updated: {
            type: Date,
            default: Date.now,
        }
    },

);



module.exports = mongoose.model('AIReview', ai_reviewSchema);