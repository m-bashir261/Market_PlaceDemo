const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const ProductCategories = require('../models/ProductCategory');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect } = require('../controllers/authController');

router.get('/', async (req, res) => {
    try {
        // 1. Parse inputs
        const { category, minRating, priceRange, search, seller } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let query = { is_active: true }; // Only show active listings

        // 1. Seller filter by username
        if (seller && seller !== 'ALL') {
            const sellerUser = await User.findOne({ username: seller.toLowerCase().trim() }).select('_id');
            if (!sellerUser) {
                return res.status(200).json([]);
            }
            query.seller_id = sellerUser._id;
        }

        // 2. Category Filter (using the ID from frontend)
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
            category_id: listing.category_id ? listing.category_id._id : null,
            // Map image_urls array to image_url string
            image_url: listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls[0] : "https://i.ibb.co/000000/default-image.jpg"
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

router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('category_id', 'name')
            .populate('seller_id', 'username flags') // Populate seller's username and flags
            .lean();

        if (!listing) {
            return res.status(404).json({ message: "Product not found" });
        }

        const formattedListing = {
            ...listing,
            category_name: listing.category_id ? listing.category_id.name : 'Uncategorized',
            category_id: listing.category_id ? listing.category_id._id : null,
            image_url: listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls[0] : "https://i.ibb.co/000000/default-image.jpg"
        };

        res.status(200).json(formattedListing);
    } catch (error) {
        console.error("Single Listing Fetch Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get comments for a product
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ listing_id: req.params.id })
            .populate('user_id', 'username firstName lastName')
            .populate('replies.user_id', 'username firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add a comment to a product
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const newComment = new Comment({
            listing_id: req.params.id,
            user_id: req.user.id,
            text
        });

        const savedComment = await newComment.save();
        
        // Populate user before returning so frontend can display immediately
        await savedComment.populate('user_id', 'username firstName lastName');

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Like/Unlike a comment
router.post('/:id/comments/:commentId/like', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const userId = req.user.id;
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(index, 1);
        }

        await comment.save();
        res.status(200).json(comment.likes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Reply to a comment
router.post('/:id/comments/:commentId/reply', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Reply text is required" });

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const newReply = {
            user_id: req.user.id,
            text
        };

        comment.replies.push(newReply);
        await comment.save();

        const updatedComment = await Comment.findById(req.params.commentId)
            .populate('user_id', 'username firstName lastName')
            .populate('replies.user_id', 'username firstName lastName');

        res.status(201).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
