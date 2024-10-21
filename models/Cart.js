const mongoose = require('mongoose');
const Item = require('./Item');

const cartItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true }, // Store the name of the item
  quantity: { type: Number, required: true },
  size: { type: String, required: false }, // Make size optional
  price: { type: Number, required: true }, // Price of the item (based on size)
});

// Method to calculate price based on the itemId and size
cartItemSchema.methods.calculatePrice = async function() {
  const item = await Item.findById(this.itemId); // Fetch the item from the Item model
  if (!item) return 0; // If the item is not found, return 0

  const sizePriceMap = item.sizes.find(s => s.size === this.size); // Find the price for the selected size
  return sizePriceMap ? sizePriceMap.price : item.price; // Return the size-specific price or base price
};

// Pre-save hook to calculate and set the item price
cartItemSchema.pre('save', async function(next) {
  this.price = await this.calculatePrice(); // Calculate the price before saving
  next();
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [cartItemSchema], // Use the cart item schema for items
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
