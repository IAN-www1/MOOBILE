const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile');
const Cart = require('../models/Cart'); // Ensure you have a Cart model

// View Order Details
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('cartItems.itemId');
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('order', { order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send(error.message);
    }
});

// Update Order Status
router.post('/orders/:id/update', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        order.status = status;
        await order.save();
        res.redirect(`/orders/${order._id}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send(error.message);
    }
});

// Place New Order
router.post('/orders', async (req, res) => {
    try {
        const { userId, totalAmount, paymentMethod, cartItems, deliveryAddress } = req.body;

        // Basic validation
        if (!userId || !totalAmount || !paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0 || !deliveryAddress) {
            return res.status(400).json({ error: 'Missing required fields or invalid data' });
        }

        // Ensure deliveryAddress contains the required fields
        const { building, floor, room } = deliveryAddress;
        if (!building || !floor || !room) {
            return res.status(400).json({ error: 'Missing delivery address fields' });
        }

        // Create a new order
        const newOrder = new Order({
            userId, // Include userId in the order
            totalAmount,
            paymentMethod,
            status: 'Pending', // default status
            cartItems,
            deliveryAddress: {
                building,
                floor,
                room
            }
        });

        // Save the new order
        await newOrder.save();

        // Clear the cart items for the user
        await Cart.deleteMany({ userId });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
});


// Clear Cart
router.post('/clear-cart', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Clear the cart items for the user
        await Cart.deleteMany({ userId });

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart. Please try again.' });
    }
});

module.exports = router;
