const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String }, // New field for the customer's name
  contact: { type: String }, // New field for the customer's contact number
  resetPasswordToken: { type: String }, // Field to store the reset token
  resetPasswordExpires: { type: Date },   // Field to store the expiration date of the reset token
  playerId: { type: String } // Field for Player ID
});

module.exports = mongoose.model('Customer', customerSchema);
