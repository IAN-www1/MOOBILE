const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile'); // Adjust the path as necessary
const multer = require('multer');
const imgur = require('imgur');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

// Set up multer for file uploads (storing files locally temporarily)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_DIR || 'uploads/'); // Temporary storage
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

router.patch('/:id/upload', upload.single('proof'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.file) {
            const imgurResponse = await imgur.uploadFile(req.file.path);
            order.proofOfDelivery = imgurResponse.data.link; // Set the Imgur link

            await order.save();

            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete local file:', err);
            });

            // Return the Imgur URL to the client
            return res.status(200).json({
                message: 'Proof of delivery uploaded successfully',
                imageUrl: imgurResponse.data.link // Ensure this is the Imgur URL
            });
        } else {
            return res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        console.error('Error uploading proof of delivery:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
