const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  try {
    const customer = await Customer.findOne({ username });
  // Log the found customer or null
  console.log('Found customer:', customer); 
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: customer._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({
      token,
      email: customer.email, // Include email in the response
      _id: customer._id.toString(), // Include _id in the response
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
