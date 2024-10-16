const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile'); // Adjust the path as necessary

// Route to fetch all mobile orders
router.get('/', async (req, res) => { // This will match /api/mobile/orders
    try {
        const orders = await Order.find().populate('userId').populate('cartItems.itemId'); // Populate user and item details
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching mobile orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
