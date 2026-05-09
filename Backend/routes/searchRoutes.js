const express = require('express');
const router  = express.Router();
const meili   = require('../services/meiliClient');

/**
 * GET /api/search?q=&limit=8
 * Multi-index search: queries "listings" and "categories" simultaneously
 * and returns a combined result shaped for the autocomplete dropdown.
 */
router.get('/', async (req, res) => {
  const q     = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit) || 8, 20);

  if (!q) return res.status(200).json({ products: [], categories: [] });

  try {
    const { results } = await meili.multiSearch({
      queries: [
        {
          indexUid: 'listings',
          q,
          limit,
          attributesToHighlight: ['title', 'description'],
          highlightPreTag:  '<mark>',
          highlightPostTag: '</mark>',
        },
        {
          indexUid: 'categories',
          q,
          limit: 5,
          attributesToHighlight: ['name'],
          highlightPreTag:  '<mark>',
          highlightPostTag: '</mark>',
        },
      ],
    });

    res.status(200).json({
      products:   results[0]?.hits || [],
      categories: results[1]?.hits || [],
    });
  } catch (err) {
    console.error('Meilisearch search error:', err.message);
    res.status(500).json({ message: 'Search unavailable', error: err.message });
  }
});

module.exports = router;
