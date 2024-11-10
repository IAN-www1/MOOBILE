const express = require('express');
const Ticket = require('../models/ticket'); // Import the ticket model
const Order_Mobile = require('../models/Order_Mobile'); // Import the Order_Mobile model

const router = express.Router();

// Route for submitting a new ticket
router.post('/submit', async (req, res) => {
  const { orderId, issueDescription, reason, solution, proofImage } = req.body;

  // Validate required fields
  if (!orderId || !issueDescription || !reason || !solution) {
    return res.status(400).json({ error: 'Order ID, Issue Description, Reason, and Solution are required.' });
  }

  try {
    // Step 1: Check if a ticket already exists for this orderId
    const existingTicket = await Ticket.findOne({ orderId });

    if (existingTicket) {
      return res.status(400).json({ error: 'A ticket has already been submitted for this order.' });
    }

    // Step 2: Create a new ticket
    const newTicket = new Ticket({
      orderId,
      issueDescription,
      reason,
      solution,
      proofImage,  // Proof image is optional, it may be null
    });

    // Save the ticket to the database
    await newTicket.save();

    // Step 3: Define the status update based on the reason
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

    // Step 4: Only update the order status if there is a valid status
    if (updatedStatus) {
      // Find the order by orderId and update its status
      const order = await Order_Mobile.findOne({ _id: orderId });

      if (order) {
        // Update the order status
        order.status = updatedStatus;

        // Save the updated order
        await order.save();

        // Debugging: Log the updated order status
        console.log(`Order status updated to: ${order.status}`);

        // Step 5: Respond with success and include the updated status
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



// Route to get all tickets (for admin purposes)
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tickets.' });
  }
});

module.exports = router;
