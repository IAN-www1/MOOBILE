const express = require('express');
const Cart = require('../models/Cart');
const Item = require('../models/Item'); // Adjust path if necessary
const router = express.Router();

// Get cart items for a user
router.get('/:userId', async (req, res) => {
  try {
    // Fetch the cart for the given userId
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.itemId');

    // Check if cart exists
    if (cart) {
      // Return the cart items
      res.json(cart);
    } else {
      // Respond with an empty cart if no cart is found
      res.status(200).json({ items: [] }); // Return an empty array for items
    }
  } catch (error) {
    // Handle server errors
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: error.message });
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
            cartItems,
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
        console.log(Order with ID: ${newOrder._id} was successfully placed for User ID: ${userId});

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
});
// Remove all items from cart
router.post('/remove-all', async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch the cart for the given userId
    const cart = await Cart.findOne({ userId });
    if (cart) {
      // Clear all items from the cart
      cart.items = [];
      await cart.save();
      res.status(200).json(cart);
    } else {
      // Respond with 404 if cart is not found
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    // Handle server errors
    console.error('Error removing all items from cart:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
