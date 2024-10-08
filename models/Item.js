const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: Number,
  description: String,
  sizes: [{
    size: String,
    price: Number,
    _id: mongoose.Schema.Types.ObjectId
  }],
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
