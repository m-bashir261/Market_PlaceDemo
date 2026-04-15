const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductCategories = require('../models/ProductCategory');

router.get('/', async (req, res) => {
    try {
        // 1. Parse and validate inputs
        const category = req.query.category || "ALL";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const minRating = req.query.minRating || 0;
        const priceRange = req.query.priceRange || "ALL";
        // 2. Build the database query object
        let query = {};
        if (category !== "ALL") {
            const catDoc = await ProductCategories.findOne({ name: category });
            if (catDoc) {
                query.category = catDoc._id;
            } else {
                query.category = null; // force no products found if invalid name
            }
        }
        query.rating = { $gte: Number(minRating) };
        if (priceRange !== "ALL") {
            const [minPrice, maxPrice] = priceRange.split("-").map(Number);
            query.price = { $gte: minPrice, $lte: maxPrice };
        }
        const products = await Product.find(query)
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedProducts = products.map(product => ({
            ...product,
            category: product.category ? product.category.name : product.category
        }));

        res.status(200).json(formattedProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        let categories = await ProductCategories.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;