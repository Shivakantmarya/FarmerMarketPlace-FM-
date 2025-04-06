const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: Number, required: true },
  image: { type: String },
});

module.exports = mongoose.model('Product', productSchema);