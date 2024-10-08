const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Assuming you have a User model
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item', // Assuming you have an Item model
  },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
