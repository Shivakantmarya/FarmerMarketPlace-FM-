const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'your-secret-key';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `user-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

const generateShortId = async () => {
  let id;
  let isUnique = false;
  while (!isUnique) {
    id = Math.floor(Math.random() * 900) + 100;
    const existingUser = await User.findOne({ userId: id });
    if (!existingUser) isUnique = true;
  }
  return id;
};

router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateShortId();
    const user = new User({
      username,
      password: hashedPassword,
      role,
      userId,
      profilePic: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, userId: user.userId, profilePic: user.profilePic },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Login token issued:', token);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: Number(req.params.userId) });
    if (!user) {
      console.log('User not found for userId:', req.params.userId); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;