const express = require('express');
const Ticket = require('../models/ticket'); // Import the ticket model
const Order_Mobile = require('../models/Order_Mobile'); // Import the Order_Mobile model
const Customer = require('../models/Customer'); // Import the Customer model (you mentioned this)

const router = express.Router();

// Route for submitting a new ticket
router.post('/submit', async (req, res) => {
  const { orderId, issueDescription, reason, solution, proofImage, userId, username } = req.body;

  // Validate required fields
  if (!orderId || !issueDescription || !reason || !solution || !userId || !username) {
    return res.status(400).json({ error: 'Order ID, Issue Description, Reason, Solution, and User ID are required.' });
  }

  try {
    // Step 1: Check if the user exists in the Customer model
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Step 2: Check if a ticket already exists for this orderId and userId
    const existingTicket = await Ticket.findOne({ orderId, userId });
    if (existingTicket) {
      return res.status(400).json({ error: 'A ticket has already been submitted for this order by this user.' });
    }

    // Step 3: Create a new ticket with userId and username
    const newTicket = new Ticket({
      orderId,
      issueDescription,
      reason,
      solution,
      proofImage,
      userId,     // Add the userId to the ticket
      username,   // Add the username to the ticket
    });

    // Save the ticket to the database
    await newTicket.save();

    // Step 4: Define the status update based on the reason
    let updatedStatus = '';

    // Use a mapping to determine the status based on the reason
    const reasonStatusMap = {
      'Missing part of the order': 'Missing Item Reported',
      'Sent the wrong item': 'Wrong Item Reported',
      'Damaged item': 'Damaged Item Reported',
      'Food not delivered': 'Order Not Delivered',
    };

    // Check if the reason is in the map, otherwise set a default status
    updatedStatus = reasonStatusMap[reason] || 'Issue Reported';  // Default status if reason not matched

    // Step 5: Only update the order status if there is a valid status
    if (updatedStatus) {
      // Find the order by orderId and update its status
      const order = await Order_Mobile.findOne({ _id: orderId });

      if (order) {
        // Update the order status
        order.status = updatedStatus;

        // Save the updated order
        await order.save();

        // Respond with success and include the updated status
        return res.status(201).json({
          message: 'Ticket submitted successfully!',
          ticket: newTicket,
          updatedStatus: order.status,  // Include updated order status in the response
        });
      } else {
        return res.status(404).json({ error: 'Order not found.' });
      }
    }

    // If no status update is needed, return success without updating the order status
    res.status(201).json({ message: 'Ticket submitted successfully!', ticket: newTicket });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error submitting ticket.' });
  }
});
// Route for fetching tickets of a specific user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;  // Extract userId from the URL params

  try {
    // Step 1: Check if the user exists in the Customer model
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Step 2: Find tickets for the user
    const tickets = await Ticket.find({ userId });

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'No tickets found for this user.' });
    }

    // Step 3: Return the found tickets
    res.status(200).json({ tickets });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching tickets.' });
  }
});
router.post('/reply/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  const { message } = req.body;  // No need to include 'sender' in the request body

  // Validate that message is provided
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Find the ticket by ticketId
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    // Add the new message to the messages array
    ticket.messages.push({
      message,
      // The sender is automatically set to 'User' by default, no need to include 'sender' in the request
      createdAt: new Date(),
    });

    // Save the updated ticket document
    await ticket.save();

    // Respond with success
    res.status(200).json({
      message: 'Reply sent successfully.',
      ticket,  // Optionally, return the updated ticket object
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending reply.' });
  }
});


module.exports = router;
