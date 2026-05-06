const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../controllers/authController');
const { ListingPost, getListings, getSingleListing, updateListing, deleteListing, getListingsByUsername } = require('../controllers/ListingController');

router.post('/', protect, ListingPost);
router.get('/', protect, getListings);
router.get('/public/seller/:username', getListingsByUsername);
router.get('/:id', protect, getSingleListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;