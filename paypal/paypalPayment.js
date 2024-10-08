// paypalPayment.js

const paypal = require('./paypalConfig');

// Function to create PayPal order
async function createOrder(items, currency = 'PHP') {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: calculateTotal(items), // Implement your logic to calculate total amount
        }
      }]
    });

    const response = await paypal.client.execute(request);
    return response.result.id;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// Function to capture (execute) PayPal order
async function captureOrder(orderId) {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await paypal.client.execute(request);
    return response.result;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

// Helper function to calculate total amount from items
function calculateTotal(items) {
  // Implement your logic to calculate the total amount from items
  // Example:
  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
  });
  return total.toFixed(2); // Ensure total is formatted properly
}

module.exports = {
  createOrder,
  captureOrder,
};
