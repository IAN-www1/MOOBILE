const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Ensure this line is present
const Order = require('../models/Order_Mobile');
const Cart = require('../models/Cart'); // Ensure you have a Cart model
const Customer = require('../models/Customer'); // Adjust path as needed
const Item = require('../models/Item'); // Ensure you have an Item model

// View Order Details
router.get('/orders/:id', async (req, res) => {
    try {
        // Fetch the order with populated cartItems
        const order = await Order.findById(req.params.id).populate('cartItems.itemId');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Map through cartItems to add soldCount
        const orderDetails = await Promise.all(order.cartItems.map(async (cartItem) => {
            const itemDetails = await Item.findById(cartItem.itemId); // Fetch item details
            return {
                ...cartItem.toObject(),
                soldCount: itemDetails ? itemDetails.soldCount : 0 // Add soldCount to the order item
            };
        }));

        // Render the order with updated order details
        res.render('order', { order: { ...order.toObject(), cartItems: orderDetails } });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send(error.message);
    }
});
// Place New Order
router.post('/orders', async (req, res) => {
    try {
        const { userId, totalAmount, paymentMethod, cartItems, deliveryAddress, deliveryOption } = req.body;

        // Basic validation
        if (!userId || !totalAmount || !paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0 || !deliveryAddress || !deliveryOption) {
            return res.status(400).json({ error: 'Missing required fields or invalid data' });
        }

        // Validate delivery option
        const validDeliveryOptions = ['Deliver', 'Self Pick-Up'];
        if (!validDeliveryOptions.includes(deliveryOption)) {
            return res.status(400).json({ error: 'Invalid delivery option' });
        }

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const _getPriceForSize = (sizes, size) => {
            if (!sizes || !size) return 0.0;

            const sizePriceMap = sizes.find(element => element.size === size);
            return sizePriceMap ? (sizePriceMap.price || 0.0) : 0.0;
        };

        // Check if payment method is PayPal and set status accordingly
        let orderStatus = 'Pending';
        if (paymentMethod.toLowerCase() === 'paypal') {
            orderStatus = 'To Pay'; // Set status to 'To Pay' if PayPal is selected
        }

        // Create a new order
        const newOrder = new Order({
            userId, // Include userId in the order
            customerName: customer.name || 'Guest', // Default to 'Guest' if no name
            customerContact: customer.contact || 'N/A', // Default to 'N/A' if no contact
            username: customer.username || 'Unknown', // Default to 'Unknown' if no username
            totalAmount,
            paymentMethod,
            status: orderStatus, // Set the order status
            // Modify cartItems to include item names and handle sizes appropriately
            cartItems: cartItems.map(item => {
                const price = item.size ? _getPriceForSize(item.itemId.sizes, item.size) || item.price : item.price;
                return {
                    ...item,
                    itemName: item.name, // Add the name of the item
                    price: price // Ensure the correct price is set
                };
            }),
            deliveryAddress, // Include deliveryAddress in the order
            deliveryOption // Include deliveryOption in the order
        });

        // Increment soldCount for each item in the order
        await Promise.all(cartItems.map(async (item) => {
            await Item.findByIdAndUpdate(item.itemId, { $inc: { soldCount: 1 } });
        }));

        // Save the new order
        await newOrder.save();

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
        const { userId, itemsToRemove } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) {
            return res.status(400).json({ error: 'Items to remove are required' });
        }

        // Loop through each item to remove individually
        for (const item of itemsToRemove) {
            const result = await Cart.updateOne(
                { userId },
                { $pull: { items: { itemId: item.itemId, size: item.size } } }
            );
            console.log(`Removing item: ${JSON.stringify(item)} - Result: ${JSON.stringify(result)}`);
        }

        res.status(200).json({ message: 'Selected items removed from cart successfully' });
    } catch (error) {
        console.error('Error clearing specific items from cart:', error);
        res.status(500).json({ error: 'Failed to clear selected items from cart. Please try again.' });
    }
});
// Get Sold Count for a Specific Item
router.get('/items/:id/count', async (req, res) => {
    try {
        const itemId = req.params.id;

        // Validate the ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid item ID format' });
        }

        // Create an ObjectId instance
        const itemObjectId = new mongoose.Types.ObjectId(itemId);

        // Aggregate to count the number of sold items with completed status
        const result = await Order.aggregate([
            { $match: { 'cartItems.itemId': itemObjectId, status: 'Completed' } }, // Match orders containing the item with Completed status
            { $unwind: '$cartItems' }, // Deconstruct the cartItems array
            { $match: { 'cartItems.itemId': itemObjectId } }, // Match again to filter cart items
            { $group: { _id: null, soldCount: { $sum: '$cartItems.quantity' } } } // Sum up the quantity sold
        ]);

        // Get sold count or default to 0
        const soldCount = result.length > 0 ? result[0].soldCount : 0;

        res.json({ soldCount });
    } catch (error) {
        console.error('Error fetching sold count:', error);
        res.status(500).json({ error: 'Failed to fetch sold count' });
    }
});

module.exports = router;
