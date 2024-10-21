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
  const { userId, itemId, quantity, size } = req.body; // Removed price as we will calculate it
  try {
    // Fetch the item from the Item model to get the name and price
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const price = item.price; // Base price of the item, you can adjust this logic if needed
    const name = item.name; // Get the item name

    // Fetch the cart for the given userId
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if one does not exist
      cart = new Cart({
        userId,
        items: [{ itemId, name, quantity, size, price }] // Include name and price when adding the item
      });
    } else {
      // Check if the item already exists in the cart with the same size
      const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId && item.size === size);

      if (itemIndex >= 0) {
        // Update quantity if the item already exists in the cart
        cart.items[itemIndex].quantity += quantity;
        // Optionally, you may want to update the price or name if they can change
        // cart.items[itemIndex].price = price;
        // cart.items[itemIndex].name = name;
      } else {
        // Add new item if it does not exist
        cart.items.push({ itemId, name, quantity, size, price }); // Include name and price here
      }
    }

    // Save the cart
    await cart.save();

    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  const { userId, itemId, size } = req.body; // Get itemId and size from request body

  try {
    // Fetch the cart for the given userId
    const cart = await Cart.findOne({ userId });
    if (cart) {
      // Remove the item from the cart based on itemId and size
      cart.items = cart.items.filter(item => 
        item.itemId.toString() !== itemId || item.size !== size // Keep items that don't match both itemId and size
      );

      await cart.save(); // Save the updated cart
      res.status(200).json(cart); // Respond with the updated cart
    } else {
      // Respond with 404 if cart is not found
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    // Handle server errors
    console.error('Error removing item from cart:', error);
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
