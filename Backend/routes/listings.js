const express = require('express');
const router = express.Router();
const Listing = require('../models/Listings');  

// Middleware to protect the route by checking if the seller is logged in
//esta3melt sessions
function requireAuth(req, res, next) {
    if (!req.session.seller_id) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    next();
}

// create a new listing
router.post('/', requireAuth, async (req, res) => {
    try {
// Inside your route file
const { title, description, price, delivery_days, image_url, category_id } = req.body;
        const seller_id = req.session.seller_id; // so it can come from the session not the form

        const newListing = new Listing({
            seller_id, 
            title,
            description,
            price,
            delivery_days,
            image_url,
            category_id
        });

        await newListing.save(); // hana5od el data w y7otaha fe el database 

        res.status(201).json({ message: 'Listing created', listing: newListing }); //201 for created

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router
