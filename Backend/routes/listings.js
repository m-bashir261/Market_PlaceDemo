const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../controllers/authController'); // Your auth middleware
const { ListingPost, getListings, getSingleListing, updateListing, deleteListing} = require('../controllers/ListingController');

// create a new listing DONT FORGET TO REMOVE COMMENT ONCE YOU TESTED IT!!!!!!
router.post('/', protect, ListingPost);
router.get('/', protect, getListings);
router.get('/:id', protect, getSingleListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router
