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

router.post('/add', async (req, res) => {
  const { userId, itemId, name, quantity, size } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] }); // Initialize a new cart
    }

    const cartItem = {
      itemId,
      name,
      quantity,
      size,
    };

    cart.items.push(cartItem); // Add the cart item to the cart

    await cart.save(); // Save the cart
    res.status(200).json({ message: 'Item added to cart successfully', cart });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
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
