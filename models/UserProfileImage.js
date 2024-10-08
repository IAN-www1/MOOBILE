const mongoose = require('mongoose');

// Define the schema for storing user profile images
const userProfileImageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user
    required: true,
    ref: 'Customer', // Ensure you have a 'Customer' model if you are referencing it
  },
  profileImageUrl: {
    type: String, // URL of the uploaded profile image
    required: true,
  },
});

// Create the model based on the schema
const UserProfileImage = mongoose.model('UserProfileImage', userProfileImageSchema);

module.exports = UserProfileImage;
