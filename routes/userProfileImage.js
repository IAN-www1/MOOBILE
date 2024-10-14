const express = require('express');
const multer = require('multer');
const path = require('path');
const UserProfileImage = require('../models/UserProfileImage');

const router = express.Router();

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Handle image upload
router.post('/upload-profile-image', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Use the remote server URL for the image path
    const profileImageUrl = `https://mobile-afff.onrender.com/uploads/${req.file.filename}`;

    let userProfileImage = await UserProfileImage.findOne({ userId });
    if (userProfileImage) {
      userProfileImage.profileImageUrl = profileImageUrl;
    } else {
      userProfileImage = new UserProfileImage({
        userId,
        profileImageUrl,
      });
    }
    await userProfileImage.save();

    res.status(200).json({ filePath: profileImageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image', error });
  }
});

// Get profile image for a specific user
router.get('/profile-image/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfileImage = await UserProfileImage.findOne({ userId });

    if (!userProfileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    res.status(200).json({ profileImageUrl: userProfileImage.profileImageUrl });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: 'Failed to retrieve image', error });
  }
});

module.exports = router;
