const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, username, password, role } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ username: username.toLowerCase() });
        if (user) return res.status(400).json({ message: "User already exists" });

        // 2. Create and save user
        // (If you want to use hashing, uncomment the bcrypt lines from your snippet)
        user = new User({
            firstName,
            lastName,
            username: username.toLowerCase(),
            password: password, // Store password
            role
        });

        await user.save();

        // 3. Generate Token immediately after saving (Auto-Login)
        const token = jwt.sign(
            { id: user._id, role: user.role === 'seller' ? 1 : 0 },
            process.env.SECRET_KEY || 'secretkey',
            { expiresIn: '1h' }
        );

        // 4. Send back the token and user data to the frontend
        res.status(201).json({ 
            message: "User registered and logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find User
        const user = await User.findOne({ username: username.toLowerCase() });
        console.log(user);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // 2. Check Password
        const isMatch = password == user.password //await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 3. Create Token (This is the user's "ID Badge")
        const token = jwt.sign(
            { id: user._id, role: user.role==='seller' ? 1 : 0 }, // Include role in token payload 1: seller, 0: buyer
            process.env.SECRET_KEY || 'secretkey',
            { expiresIn: '1h' }
        );

        // 4. Send back the token AND the role
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role // The frontend will use this to redirect
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth error: Missing or malformed Bearer token');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secretkey');
        req.user = { id: decoded.id }; // make sure your JWT payload uses `id`
        next();
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({ 
            message: 'Invalid token',
            details: err.message,
            tip: 'Please log in again'
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSellerInfo = async (req, res) => {
    try {
        const { username } = req.params;
        console.log('getSellerInfo called with username:', username);
        
        // Find seller by username
        const seller = await User.findOne({ username: username.toLowerCase() }).select('username flags');
        console.log('Seller found:', seller);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });
        
        // Get all listings for this seller
        const listings = await Listing.find({ seller_id: seller._id });
        console.log('Listings found:', listings.length);
        
        let averageRating = 0;
        let totalReviews = 0;
        
        // Only query reviews if there are listings
        if (listings.length > 0) {
            const listingIds = listings.map(l => l._id);
            const reviews = await Review.find({ listing_id: { $in: listingIds } });
            totalReviews = reviews.length;
            console.log('Reviews found:', reviews.length);
            averageRating = reviews.length > 0 
                ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
                : 0;
        }
        
        const responseData = {
            username: seller.username,
            flags: seller.flags || 0,
            rating: averageRating,
            totalReviews: totalReviews
        };
        console.log('Sending response:', responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in getSellerInfo:', error);
        res.status(500).json({ message: error.message });
    }
};