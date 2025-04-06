// const express = require('express');
// const mongoose = require('mongoose');
// const http = require('http');
// const socketIo = require('socket.io');
// const productRoutes = require('./routes/products');
// const authRoutes = require('./routes/auth');
// const messageRoutes = require('./routes/messages');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//   credentials: true,
// }));

// mongoose.connect('mongodb://localhost/farmer-marketplace', { useNewUrlParser: true, useUnifiedTopology: true });

// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/messages', messageRoutes);

// const Product = require('./models/Product'); // Import Product model

// app.set('emitProductUpdate', async () => {
//   try {
//     const products = await Product.find().exec(); // Fetch products
//     io.emit('productsUpdated', products); // Emit resolved data
//   } catch (err) {
//     console.error('Error emitting product update:', err);
//   }
// });

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);
//   socket.on('productAdded', () => {
//     app.get('emitProductUpdate')();
//   });
// });

// server.listen(5000, () => console.log('Server running on port 5000'));



const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT
    credentials: true,
  },
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added PUT
  credentials: true,
}));

mongoose.connect('mongodb://localhost/farmer-marketplace', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const Product = require('./models/Product'); // Import Product model

app.set('emitProductUpdate', async () => {
  try {
    const products = await Product.find().exec(); // Fetch products
    io.emit('productsUpdated', products); // Emit resolved data
  } catch (err) {
    console.error('Error emitting product update:', err);
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('productAdded', () => {
    app.get('emitProductUpdate')();
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));