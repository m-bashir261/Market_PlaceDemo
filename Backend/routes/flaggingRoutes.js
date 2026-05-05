const express = require('express');
const router = express.Router();
const { flagBuyer, flagSeller } = require('../controllers/flaggingController');
const { protect } = require('../controllers/authController'); // Your auth middleware


// Route for sellers to flag a buyer good or bad for an order
router.put('/:orderNumber/flag-buyer', protect, flagBuyer);

// Route for sellers to flag a seller good or bad for an order
router.put('/:orderNumber/flag-seller', protect, flagSeller);

module.exports = router;