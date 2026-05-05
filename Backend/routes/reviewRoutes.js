const express = require('express');
const router = express.Router();
const { submitReview, getListingReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

router.post('/', protect, submitReview);
router.get('/listing/:listingId', getListingReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;