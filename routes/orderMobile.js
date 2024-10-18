const express = require('express');
const router = express.Router();
const Order_Mobile = require('../models/Order_Mobile');

// GET: Retrieve orders for a specific user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order_Mobile.find({ userId: userId });
    
    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET: Retrieve order details including item info
router.get('/order/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order_Mobile.findById(orderId).populate('cartItems.itemId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Transform the order response to include price, name, size, and proof of delivery
    const orderDetail = {
      _id: order._id,
      totalAmount: order.totalAmount,
      status: order.status,
      proofOfDelivery: order.proofOfDelivery || null, // Include proof of delivery if available
      cartItems: order.cartItems.map(item => {
        let price;

        // Check if the item has a size
        if (item.size) {
          // Try to find the size in the item's sizes array
          const sizeDetail = item.itemId.sizes.find(size => size.size === item.size);
          price = sizeDetail ? sizeDetail.price : item.itemId.price; // Fallback to item price if size not found
        } else {
          price = item.itemId.price; // Use the item's price if size is not specified
        }

        return {
          itemId: item.itemId._id,
          name: item.itemId.name,
          image: item.itemId.image, // Add image to response
          size: item.size || null, // Set size to null if not provided
          quantity: item.quantity,
          price: price,
        };
      }),
    };

    res.status(200).json(orderDetail);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


module.exports = router;
