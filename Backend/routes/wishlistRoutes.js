const express = require('express');
const router  = express.Router();
const { protect } = require('../controllers/authController');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlistIds,
} = require('../controllers/wishlistController');

// All routes require authentication
router.get('/',              protect, getWishlist);
router.get('/ids',           protect, getWishlistIds);
router.post('/:productId',   protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
