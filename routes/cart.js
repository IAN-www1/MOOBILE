const mongoose = require('mongoose');
const Item = require('../models/Item');

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: false }, // Make size optional
    price: { type: Number, required: true } // Added price field
  }],
});

// Optional: Create a method to calculate the price based on size
cartItemSchema.methods.calculatePrice = async function() {
  const item = await Item.findById(this.itemId); // Fetch the item
  if (!item) return 0; // Handle case where item is not found

  const sizePriceMap = item.sizes.find(s => s.size === this.size); // Find size pricing
  return sizePriceMap ? sizePriceMap.price : item.basePrice; // Use size price or base price
};

// Update the cart item price when adding to the cart
cartItemSchema.pre('save', async function(next) {
  this.price = await this.calculatePrice();
  next();
});

const Cart = mongoose.model('Cart', cartItemSchema);

module.exports = Cart;
