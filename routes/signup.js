const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');

// Route for customer signup
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingCustomer) {
      if (existingCustomer.username === username) {
        return res.status(409).send('Username is already taken');
      }
      if (existingCustomer.email === email) {
        return res.status(409).send('Email is already registered');
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Save customer to database
    const newCustomer = new Customer({
      username,
      email,
      password: hashedPassword,
    });
    await newCustomer.save();

    res.status(201).send('Customer created successfully');
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).send('Error creating customer');
  }
});

module.exports = router;
