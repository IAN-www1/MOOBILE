const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer'); // Adjust path as needed
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Change Password Route
router.post('/change-password', [
  check('userId').notEmpty().withMessage('User ID is required'),
  check('oldPassword').notEmpty().withMessage('Old password is required'),
  check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, oldPassword, newPassword } = req.body;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: 'User not found' });

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    // Update password
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);

    await customer.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update Customer Info Route
router.post('/update-customer-info', [
  check('userId').notEmpty().withMessage('User ID is required'),
  check('name').optional().isString().withMessage('Name must be a string'),
  check('contact').optional().isString().withMessage('Contact must be a string')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, name, contact } = req.body;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: 'User not found' });

    // Update name and contact if provided
    if (name) customer.name = name;
    if (contact) customer.contact = contact;

    await customer.save();

    res.status(200).json({ message: 'Customer info updated successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get Customer Details Route
router.get('/customer-details/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: 'User not found' });

    // Return customer details
    res.status(200).json({
      userId: customer._id,
      name: customer.name,
      contact: customer.contact,
      // Add any additional fields you want to return here
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error });
  }
});
module.exports = router;
