const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String }, // New field for the customer's name
  contact: { type: String }, // New field for the customer's contact number
  resetPasswordToken: { type: String }, // Field to store the reset token
  resetPasswordExpires: { type: Date },   // Field to store the expiration date of the reset token
  playerId: { type: String }, // Field for Player ID
  
  // New fields for RFID
  rfidTagId: { type: String, required: false, unique: true }, // RFID tag ID (unique for each customer)
  balance: { type: Number, default: 0.0 }, // The balance associated with the RFID tag
});

module.exports = mongoose.model('Customer', customerSchema);
