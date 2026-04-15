const mongoose = require("mongoose")

const product = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price:{type: Number, required: true},
    imageUrl: {type: String, required: true, default: "https://i.ibb.co/000000/default-image.jpg"},
    rating: {type: Number, required: true, default: 0},
    numReviews: {type: Number, required: true, default: 0},
    brand: {type: String},
    countInStock: {type: Number, required: true, default: 0},
    numSold: {type: Number, required: true, default: 0},
    deliveryEstimate: {type: String},
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ProductCategory"
    },

    sellerID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", product)