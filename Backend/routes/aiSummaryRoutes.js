const express = require('express');
const router  = express.Router();
const { getAISummary, triggerAISummary } = require('../controllers/aiSummaryController');
const { protect } = require('../controllers/authController');

/**
 * GET /api/ai-summary/:listingId
 * Public — any visitor can fetch the AI summary for a product.
 */
router.get('/:listingId', getAISummary);

/**
 * POST /api/ai-summary/:listingId/trigger
 * Protected — only authenticated users (admin) can force a re-run.
 * Remove `protect` middleware if you want an open debug endpoint.
 */
router.post('/:listingId/trigger', protect, triggerAISummary);

module.exports = router;
