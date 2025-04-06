const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer'], required: true },
  userId: { type: Number, required: true, unique: true },
  profilePic: { type: String },
});

module.exports = mongoose.model('User', userSchema);