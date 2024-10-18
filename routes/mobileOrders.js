const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile'); // Adjust the path as necessary
const multer = require('multer');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_DIR || 'uploads/'); // Use environment variable for uploads folder
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`); // Rename the file to avoid conflicts
    },
});

const upload = multer({ storage: storage });

// Route to fetch all mobile orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('cartItems.itemId'); // Populate user and item details
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching mobile orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to fetch a single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId').populate('cartItems.itemId'); // Populate user and item details
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order); // Return the order details
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update order status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body; // Get the new status from the request body

    if (!status) {
        return res.status(400).json({ message: 'Status is required' }); // Handle case where status is not provided
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status }, // Update the status field
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(updatedOrder); // Return the updated order
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to upload proof of delivery
router.patch('/:id/upload', upload.single('proof'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.file) {
            // Save the relative file path in the order document
            order.proofOfDelivery = req.file.path; // This should be the relative path
            await order.save(); // Save the updated order
            
            // Construct the URL for the uploaded image
            const imageUrl = `${req.protocol}://${req.get('host')}/${order.proofOfDelivery}`;
            return res.status(200).json({ message: 'Proof of delivery uploaded successfully', imageUrl });
        } else {
            return res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        console.error('Error uploading proof of delivery:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
