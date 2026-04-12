const express = require('express');
const router = express.Router();
const Listing = require('../models/Listings');  

// Middleware to protect the route by checking if the seller is logged in
function requireAuth(req, res, next) {
    if (!req.session.seller_id) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    next();
}

