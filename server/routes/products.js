const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'your-secret-key';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token received:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Only farmers can add products' });
  }
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    farmer: req.user.userId,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  });
  try {
    const newProduct = await product.save();
    req.app.get('emitProductUpdate')();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Only farmers can delete products' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.farmer !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await product.remove();
    req.app.get('emitProductUpdate')();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;