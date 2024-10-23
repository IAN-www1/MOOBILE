// routes/items.js
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET all items with their favorite count
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().select('name image price description favoriteCount'); // Fetch required fields
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Optional: If you want to fetch a specific item's favorite count
router.get('/:id/favorites', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId).select('favoriteCount');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ favoriteCount: item.favoriteCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
