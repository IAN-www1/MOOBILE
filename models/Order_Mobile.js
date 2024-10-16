const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Assuming you have a User model
        required: true 
    },
    billingDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    cartItems: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
            quantity: { type: Number, required: true },
            size: { type: String, required: false }, // Size field is optional
            price: { type: Number, required: false } // Price field is now optional
        }
    ]
});

// Pre-save middleware to set the price based on itemId if not provided
orderSchema.pre('save', async function(next) {
    const cartItems = this.cartItems;
    for (const item of cartItems) {
        if (!item.price) {
            const foundItem = await mongoose.model('Item').findById(item.itemId);
            if (foundItem) {
                item.price = foundItem.price; // Set the price from the Item model
            }
        }
    }
    next();
});

module.exports = mongoose.model('Mobile_Order', orderSchema);
