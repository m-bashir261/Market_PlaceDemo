const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductCategories = require('../models/ProductCategory');
const Listing = require('../models/Listing');

router.get('/', async (req, res) => {
    try {
        // 1. Parse inputs
        const { category, minRating, priceRange, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let query = {is_active: true}; // Only show active listings

        // 1. Category Filter (using the ID from frontend)
        if (category && category !== "ALL") {
            query.category_id = category; 
        }

        // 2. Minimum Rating Filter
        if (minRating && parseFloat(minRating) > 0) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // 3. Price range filter
        if (priceRange && priceRange !== "ALL") {
            const [minPrice, maxPrice] = priceRange.split("-").map(Number);
            query.price = { $gte: minPrice, $lte: maxPrice };
        }

        // 4. Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // 5. Execute Query on the Listing model
        const listings = await Listing.find(query)
            .populate('category_id', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 }) // Show newest first
            .lean();

        // 6. Format for the frontend
        const formattedListings = listings.map(listing => ({
            ...listing,
            // Convert the populated object into a simple string for the UI
            category_name: listing.category_id ? listing.category_id.name : 'Uncategorized',
            // Ensure category_id remains an ID string if the frontend needs it
            category_id: listing.category_id ? listing.category_id._id : null
        }));

        res.status(200).json(formattedListings);
    } catch (error) {
        console.error("Listing Fetch Error:", error);
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