// paypalRoutes.js

const express = require('express');
const router = express.Router();
const paypalPayment = require('./paypalPayment');

// Route for creating a PayPal order
router.post('/pay', async (req, res) => {
  try {
    const orderId = await paypalPayment.createOrder(req.body.items);
    res.json({ orderId });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Route for capturing (executing) a PayPal order
router.post('/capture/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const captureResult = await paypalPayment.captureOrder(orderId);
    res.json(captureResult);
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// Route for handling successful payment
router.get('/success', (req, res) => {
  res.render('paymentSuccess'); // Render success page or handle redirect as needed
});

// Route for handling canceled payment
router.get('/cancel', (req, res) => {
  res.render('paymentCanceled'); // Render cancellation page or handle redirect as needed
});

module.exports = router;
