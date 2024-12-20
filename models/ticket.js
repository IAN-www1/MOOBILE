const mongoose = require('mongoose');

// Define the ticket schema with additional fields: reason, solution, proofImage
const ticketSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  issueDescription: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,  // You can modify this to 'required: false' based on your business logic
  },
  solution: {
    type: String,
    required: true,  // You can modify this to 'required: false' based on your business logic
  },
  proofImage: {
    type: String,  // Storing the image as a base64-encoded string
    default: null, // Optional field (can be null if no image is uploaded)
  },
  userId: { // Make sure userId is here and linked to the Customer
    type: mongoose.Schema.Types.ObjectId, // Reference to the Customer model
    ref: 'Customer',
    required: true,
  },
  username: {  // Add username field
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'Open', // Ticket is open by default
  },
  messages: [
    {
      message: {
        type: String,
        required: true,  // Message content is required
      },
      sender: {
        type: String,
        default: 'User', // Default sender is 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
});
// Create and export the Ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
