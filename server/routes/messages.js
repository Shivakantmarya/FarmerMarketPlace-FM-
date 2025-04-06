// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const Message = require('../models/Message');
// const User = require('../models/User');

// const JWT_SECRET = 'your-secret-key';

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   console.log('Auth middleware - Token:', token);
//   if (!token) return res.status(401).json({ message: 'No token provided' });
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log('Auth middleware - Decoded:', decoded);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Auth middleware - Error:', err.message, err.stack);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Sanity check route
// router.get('/senders/test', authMiddleware, (req, res) => {
//   console.log('GET /senders/test - Accessed by user:', req.user.userId);
//   res.json({ message: 'Senders test route working' });
// });

// router.get('/senders', authMiddleware, async (req, res) => {
//   try {
//     console.log('GET /senders - Starting for user:', req.user.userId);
    
//     let messages;
//     try {
//       messages = await Message.find({ receiverId: req.user.userId });
//     } catch (dbErr) {
//       console.error('GET /senders - Database fetch error:', dbErr.message);
//       return res.status(500).json({ message: 'Failed to fetch messages from database' });
//     }
//     console.log('GET /senders - Raw messages:', messages);

//     if (!messages || messages.length === 0) {
//       console.log('GET /senders - No messages found');
//       return res.json([]);
//     }

//     const validMessages = messages.filter(msg => {
//       const id = Number(msg.senderId);
//       const isValid = !isNaN(id) && id !== null && typeof msg.senderId === 'number';
//       console.log('GET /senders - Checking senderId:', msg.senderId, 'Valid:', isValid);
//       return isValid;
//     });

//     const senderIds = [...new Set(validMessages.map(msg => Number(msg.senderId)))];
//     console.log('GET /senders - Filtered sender IDs:', senderIds);

//     const senders = [];
//     for (const senderId of senderIds) {
//       try {
//         const user = await User.findOne({ userId: senderId });
//         console.log('GET /senders - User lookup for', senderId, ':', user ? user : 'Not found');
//         if (user) {
//           senders.push({ userId: senderId, username: user.username });
//         }
//       } catch (lookupErr) {
//         console.error('GET /senders - Lookup error for', senderId, ':', lookupErr.message);
//       }
//     }
//     console.log('GET /senders - Final senders:', senders);
//     res.json(senders);
//   } catch (err) {
//     console.error('GET /senders - Unexpected error:', err.message, err.stack);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.post('/', authMiddleware, async (req, res) => {
//   const { receiverId, content } = req.body;
//   console.log('POST /messages - Sender:', req.user.userId, 'Receiver:', receiverId, 'Content:', content);
  
//   const senderId = Number(req.user.userId);
//   const parsedReceiverId = Number(receiverId);
  
//   if (!receiverId || !content || isNaN(parsedReceiverId) || isNaN(senderId)) {
//     console.error('POST /messages - Invalid fields:', { senderId, receiverId, content });
//     return res.status(400).json({ message: 'Valid numeric sender/receiver IDs and content required' });
//   }

//   const message = new Message({
//     senderId,
//     receiverId: parsedReceiverId,
//     content,
//   });
//   try {
//     const savedMessage = await message.save();
//     console.log('POST /messages - Saved:', savedMessage);
//     res.status(201).json(savedMessage);
//   } catch (err) {
//     console.error('POST /messages - Save error:', err.message, err.stack);
//     res.status(400).json({ message: err.message });
//   }
// });

// router.get('/:otherUserId', authMiddleware, async (req, res) => {
//   const { otherUserId } = req.params;
//   const parsedOtherUserId = Number(otherUserId);
//   console.log('GET /messages/:id - User:', req.user.userId, 'OtherUserId:', parsedOtherUserId);
  
//   if (isNaN(parsedOtherUserId)) {
//     console.error('GET /messages/:id - Invalid otherUserId:', otherUserId);
//     return res.status(400).json({ message: 'Invalid otherUserId' });
//   }

//   try {
//     const messages = await Message.find({
//       $or: [
//         { senderId: req.user.userId, receiverId: parsedOtherUserId },
//         { senderId: parsedOtherUserId, receiverId: req.user.userId },
//       ],
//     }).sort({ timestamp: 1 });
//     console.log('GET /messages/:id - Fetched:', messages);
//     res.json(messages);
//   } catch (err) {
//     console.error('GET /messages/:id - Error:', err.message, err.stack);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get('/unread/count', authMiddleware, async (req, res) => {
//   try {
//     const unreadCount = await Message.countDocuments({
//       receiverId: req.user.userId,
//       read: false,
//     });
//     console.log('GET /unread/count - User:', req.user.userId, 'Count:', unreadCount);
//     res.json({ unreadCount });
//   } catch (err) {
//     console.error('GET /unread/count - Error:', err.message, err.stack);
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const JWT_SECRET = 'your-secret-key';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Auth middleware - Token:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware - Error:', err.message, err.stack);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Sanity check route
router.get('/senders/test', authMiddleware, (req, res) => {
  console.log('GET /senders/test - Accessed by user:', req.user.userId);
  res.json({ message: 'Senders test route working' });
});

router.get('/senders', authMiddleware, async (req, res) => {
  try {
    console.log('GET /senders - Starting for user:', req.user.userId);
    
    let messages;
    try {
      messages = await Message.find({ receiverId: req.user.userId });
    } catch (dbErr) {
      console.error('GET /senders - Database fetch error:', dbErr.message);
      return res.status(500).json({ message: 'Failed to fetch messages from database' });
    }
    console.log('GET /senders - Raw messages:', messages);

    if (!messages || messages.length === 0) {
      console.log('GET /senders - No messages found');
      return res.json([]);
    }

    const validMessages = messages.filter(msg => {
      const id = Number(msg.senderId);
      const isValid = !isNaN(id) && id !== null && typeof msg.senderId === 'number';
      console.log('GET /senders - Checking senderId:', msg.senderId, 'Valid:', isValid);
      return isValid;
    });

    const senderIds = [...new Set(validMessages.map(msg => Number(msg.senderId)))];
    console.log('GET /senders - Filtered sender IDs:', senderIds);

    const senders = [];
    for (const senderId of senderIds) {
      try {
        const user = await User.findOne({ userId: senderId });
        console.log('GET /senders - User lookup for', senderId, ':', user ? user : 'Not found');
        if (user) {
          senders.push({ userId: senderId, username: user.username });
        }
      } catch (lookupErr) {
        console.error('GET /senders - Lookup error for', senderId, ':', lookupErr.message);
      }
    }
    console.log('GET /senders - Final senders:', senders);
    res.json(senders);
  } catch (err) {
    console.error('GET /senders - Unexpected error:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  console.log('POST /messages - Sender:', req.user.userId, 'Receiver:', receiverId, 'Content:', content);
  
  const senderId = Number(req.user.userId);
  const parsedReceiverId = Number(receiverId);
  
  if (!receiverId || !content || isNaN(parsedReceiverId) || isNaN(senderId)) {
    console.error('POST /messages - Invalid fields:', { senderId, receiverId, content });
    return res.status(400).json({ message: 'Valid numeric sender/receiver IDs and content required' });
  }

  const message = new Message({
    senderId,
    receiverId: parsedReceiverId,
    content,
    read: false, // Explicitly set as unread by default
  });
  try {
    const savedMessage = await message.save();
    console.log('POST /messages - Saved:', savedMessage);
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('POST /messages - Save error:', err.message, err.stack);
    res.status(400).json({ message: err.message });
  }
});

router.get('/:otherUserId', authMiddleware, async (req, res) => {
  const { otherUserId } = req.params;
  const parsedOtherUserId = Number(otherUserId);
  console.log('GET /messages/:id - User:', req.user.userId, 'OtherUserId:', parsedOtherUserId);
  
  if (isNaN(parsedOtherUserId)) {
    console.error('GET /messages/:id - Invalid otherUserId:', otherUserId);
    return res.status(400).json({ message: 'Invalid otherUserId' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.userId, receiverId: parsedOtherUserId },
        { senderId: parsedOtherUserId, receiverId: req.user.userId },
      ],
    }).sort({ timestamp: 1 });
    console.log('GET /messages/:id - Fetched:', messages);
    res.json(messages);
  } catch (err) {
    console.error('GET /messages/:id - Error:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user.userId,
      read: false,
    });
    console.log('GET /unread/count - User:', req.user.userId, 'Count:', unreadCount);
    res.json({ unreadCount });
  } catch (err) {
    console.error('GET /unread/count - Error:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

// New endpoint: Mark messages as read
router.put('/read/:senderId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Current user (receiver)
    const senderId = Number(req.params.senderId); // Sender of the messages

    if (isNaN(senderId)) {
      console.error('PUT /read/:senderId - Invalid senderId:', req.params.senderId);
      return res.status(400).json({ message: 'Invalid senderId' });
    }

    console.log('PUT /read/:senderId - Marking messages as read for User:', userId, 'from Sender:', senderId);

    // Update all unread messages from this sender to read
    const result = await Message.updateMany(
      { senderId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    console.log('PUT /read/:senderId - Updated:', result.modifiedCount, 'messages');
    res.json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('PUT /read/:senderId - Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;