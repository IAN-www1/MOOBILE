const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile');
const Cart = require('../models/Cart'); // Ensure you have a Cart model
const Customer = require('../models/Customer'); // Adjust path as needed

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
    console.log('Received request to update order:', req.params.id); // Debugging line
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

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Create a new order
        const newOrder = new Order({
            userId, // Include userId in the order
            customerName: customer.name || 'Guest', // Default to 'Guest' if no name
            customerContact: customer.contact || 'N/A', // Default to 'N/A' if no contact
            username: customer.username || 'Unknown', // Default to 'Unknown' if no username
            totalAmount,
            paymentMethod,
            status: 'Pending', // default status
            cartItems: cartItems.map(item => {
                // Include the item name in the order
                return {
                    itemId: item.itemId,
                    quantity: item.quantity,
                    size: item.size || null, // Accept size or set to null if not provided
                    price: item.price // Include price, which should already be set correctly in the cart
                };
            }),
            deliveryAddress // Include deliveryAddress in the order
        });

        // Save the new order
        await newOrder.save();

        // Clear the cart items for the user
        await Cart.deleteMany({ userId });

        // Send success response
        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: newOrder._id,
            orderDetails: newOrder
        });

        // Log the successful checkout (print message)
        console.log(`Order with ID: ${newOrder._id} was successfully placed for User ID: ${userId}`);

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
