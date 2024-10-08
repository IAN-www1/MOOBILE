const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer'); // Adjust path if needed

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer details' });
  }
});

module.exports = router;
