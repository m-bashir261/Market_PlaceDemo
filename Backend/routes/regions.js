// routes/regions.js (Add this to your server.js/app.js)
const express = require('express');
const router = express.Router();
const Region = require('../models/Regions');

router.get('/', async (req, res) => {
  try {
    // Only get active regions, sorted alphabetically
    const regions = await Region.find({ isActive: true }).sort({ name: 1 });
    res.json(regions.map(r => r.name)); // Just send an array of strings: ['Alexandria', 'Cairo', ...]
  } catch (err) {
    res.status(500).json({ message: 'Error fetching regions' });
  }
});

module.exports = router;