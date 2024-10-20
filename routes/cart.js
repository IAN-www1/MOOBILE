const express = require('express');
const Cart = require('../models/Cart');
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

// Add item to cart
router.post('/add', async (req, res) => {
  const { userId, itemId, quantity, size, price, name } = req.body; // Include itemName here

  try {
    // Fetch the cart for the given userId
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if one does not exist
      cart = new Cart({
        userId,
        items: [{ itemId, quantity, size, price, name: itemName }] // Use 'name' instead of 'itemName'
      });
    } else {
      // Update quantity if item already exists in the cart
      const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId && item.size === size);
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
        // Optionally, you may want to update the price if it can change
        // cart.items[itemIndex].price = price; 
      } else {
        // Add new item if it does not exist
        cart.items.push({ itemId, quantity, size, price, name: itemName }); // Use 'name' instead of 'itemName'
      }
    }

    // Save the updated cart
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error) {
    // Handle server errors
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: error.message });
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
