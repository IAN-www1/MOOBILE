const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Route to handle email confirmation
router.get('/:confirmationCode', async (req, res) => {
  const { confirmationCode } = req.params;

  try {
    // Find the customer with the matching confirmation code
    const customer = await Customer.findOne({
      confirmationCode,
      confirmationExpires: { $gt: Date.now() }, // Check if the code is still valid
      isConfirmed: false // Ensure the email hasn't been confirmed yet
    });

    if (!customer) {
      return res.status(400).send({ message: 'Confirmation code is invalid or expired.' });
    }

    // Activate the customer's account
    customer.confirmationCode = undefined; // Clear the confirmation code
    customer.confirmationExpires = undefined; // Clear the expiration date
    customer.isConfirmed = true; // Mark the email as confirmed
    await customer.save();

    res.status(200).send({ message: 'Email successfully confirmed! You can now log in.' });
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
