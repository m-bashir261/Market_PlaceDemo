const mongoose = require("mongoose")
const productCategory= new mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        imageUrl: {type: String, required: true, default: "https://i.ibb.co/000000/default-image.jpg"},
    },
)
module.exports = mongoose.model("ProductCategory", productCategory)