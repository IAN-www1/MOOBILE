const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route for requesting password reset
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await customer.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="https://mobile-c0tj.onrender.com/reset/${resetToken}">here</a> to reset your password.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).send('Error requesting password reset');
  }
});

module.exports = router;
