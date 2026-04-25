const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Middleware to protect the route by checking if the seller is logged in
//esta3melt sessions
function requireAuth(req, res, next) {
    if (!req.session.seller_id) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    next();
}

// create a new listing DONT FORGET TO REMOVE COMMENT ONCE YOU TESTED IT!!!!!!
router.post('/', /* requireAuth,*/ async (req, res) => {
    try {
        // Inside your route file
        const { title, description, price, delivery_days, image_url, category_id, countInStock } = req.body;
        //const seller_id = req.session.seller_id; // so it can come from the session not the form
        
        // FAKE IDs FOR TESTING (Mongoose needs 24 characters)
        const fakeSellerId = "65f1a2b3c4d5e6f7a8b9c0d1";
        const fakeCategoryId = category_id || "65f1a2b3c4d5e6f7a8b9c0d6";

        const newListing = new Listing({
            seller_id: fakeSellerId, // !!!!Replace with actual seller_id from session
            title,
            description,
            price,
            delivery_days,
            image_urls: image_url,
            countInStock,
            category_id: fakeCategoryId // !!!!Replace with actual category_id from session
        });

        await newListing.save(); // hana5od el data w y7otaha fe el database 

        res.status(201).json({ message: 'Listing created', listing: newListing }); //201 for created

    } catch (error) {
        //res.status(500).json({ message: 'Something went wrong', error: error.message });
        res.status(500).json({ message: error.message });  }
});

module.exports = router
