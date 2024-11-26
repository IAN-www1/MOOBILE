const express = require('express');
const axios = require('axios');
const router = express.Router();
const Order = require('../models/Order_Mobile'); // Assuming the Order_Mobile model is defined here
const { PAYPAL_CLIENT_ID, PAYPAL_SECRET } = process.env; // PayPal credentials from environment variables

// PayPal API endpoints
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // For sandbox environment, change to live for production

// Create a PayPal order
router.post('/create-paypal-order', async (req, res) => {
  const { orderId } = req.body; // Get the orderId from the client

  try {
    // Fetch the order from the database using the orderId (_id)
    const order = await Order.findById(orderId); // Fetch order based on _id field

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    const totalAmount = order.totalAmount; // Retrieve totalAmount from the fetched order

    // Get PayPal token
    const tokenResponse = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Create the PayPal order
    const orderResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'PHP', // Change this if using other currencies
              value: totalAmount.toString(), // Convert totalAmount to string to match PayPal's requirement
            },
          },
        ],
        application_context: {
            return_url: `https://mobile-c0tj.onrender.com/api/success?orderId=${orderId}`,  // Pass the _id (orderId)
            cancel_url: 'https://mobile-c0tj.onrender.com/api/cancel', // Adjust URL as needed
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the approval URL from PayPal's response
    const approvalUrl = orderResponse.data.links.find(link => link.rel === 'approve').href;
    
    // Send the approval URL to the client
    res.json({ approvalUrl });
  } catch (error) {
    console.error('Error creating PayPal order:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

router.get('/success', async (req, res) => {
    const { orderId, token, PayerID } = req.query;
  
    // Check if we received all necessary parameters
    if (!orderId || !token || !PayerID) {
      return res.status(400).json({ error: 'Missing orderId, token, or payer ID' });
    }
  
    console.log('Received orderId:', orderId);
    console.log('Received token:', token);
    console.log('Received PayerID:', PayerID);
  
    try {
      // Step 1: Get PayPal access token
      const tokenResponse = await axios.post(
        `${PAYPAL_API}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      const accessToken = tokenResponse.data.access_token;
  
      // Step 2: Capture the PayPal payment using the token
      const captureResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Step 3: Check if the payment is successful
      if (captureResponse.data.status === 'COMPLETED') {
        // Step 4: Update the order status in the database using the orderId (which is the MongoDB _id)
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,  // MongoDB _id passed as orderId
          { status: 'Pending' },  // Update the order status
          { new: true }  // Return the updated order
        );
  
        if (!updatedOrder) {
          return res.status(400).json({ error: 'Order not found or unable to update status' });
        }
  
        // Step 5: Respond with the success message
        return res.render('success', {
            orderDetails: updatedOrder
          });      } else {
        console.error('Payment capture failed:', captureResponse.data);
        return res.status(400).json({ error: 'Payment capture failed' });
      }
    } catch (error) {
      console.error('Error during PayPal payment capture:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Failed to capture PayPal payment' });
    }
  });
  
  router.get('/cancel', (req, res) => {
    // Handle the case when the user cancels the PayPal payment
    console.log('Payment was canceled by the user.');
  
    // Render the cancel.ejs view and pass a simple cancellation message and a return link
    res.render('cancel', {
      message: 'Your payment has been canceled. You can return to the shop.',
    });
});
module.exports = router;
