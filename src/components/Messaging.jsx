// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import './Messaging.css';

// function Messaging({ user }) {
//   const { otherUserId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [otherUserName, setOtherUserName] = useState('Unknown');
//   const token = localStorage.getItem('token'); // Get token from localStorage

//   useEffect(() => {
//     const fetchMessages = async () => {
//       console.log('Fetching messages for:', otherUserId, 'with token:', token);
//       try {
//         const res = await axios.get(`/api/messages/${otherUserId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMessages(res.data);
//       } catch (err) {
//         console.error('Failed to fetch messages:', err.response?.data);
//       }
//     };

//     const fetchOtherUserName = async () => {
//       try {
//         const res = await axios.get(`/api/auth/user/${otherUserId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setOtherUserName(res.data.username);
//       } catch (err) {
//         console.error('Failed to fetch other user name:', err.response?.data);
//         setOtherUserName('Unknown');
//       }
//     };

//     if (token) {
//       fetchMessages();
//       fetchOtherUserName();
//     } else {
//       console.error('No token available, redirecting to login');
//       window.location.href = '/login';
//     }
//   }, [otherUserId, token]);

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     try {
//       const res = await axios.post(
//         '/api/messages',
//         { receiverId: otherUserId, content: newMessage },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMessages([...messages, res.data]);
//       setNewMessage('');
//     } catch (err) {
//       console.error('Failed to send message:', err.response?.data);
//     }
//   };


//   return (
//     <div className="messaging-container">
//       <h2>Messages with {otherUserName} (ID: {otherUserId})</h2>
//       <div className="messages">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`message ${msg.senderId === user?.userId ? 'sent' : 'received'}`}
//           >
//             <p>{msg.content}</p>
//             <span>{new Date(msg.timestamp).toLocaleString()}</span>
//           </div>
//         ))}
//       </div>
//       <form onSubmit={sendMessage} className="message-form">
//         <textarea
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button type="submit">Send</button>
//       </form>
//     </div>
//   );
// }

// export default Messaging;






import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './Messaging.css';

const socket = io('http://localhost:5000'); // Initialize Socket.IO connection

function Messaging({ user }) {
  const { otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('Unknown');
  const token = localStorage.getItem('token'); // Get token from localStorage

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages for:', otherUserId, 'with token:', token);
      try {
        const res = await axios.get(`/api/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err.response?.data);
      }
    };

    const fetchOtherUserName = async () => {
      try {
        const res = await axios.get(`/api/auth/user/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOtherUserName(res.data.username);
      } catch (err) {
        console.error('Failed to fetch other user name:', err.response?.data);
        setOtherUserName('Unknown');
      }
    };

    const markMessagesAsRead = async () => {
      try {
        console.log('Marking messages as read from:', otherUserId);
        await axios.put(`/api/messages/read/${otherUserId}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        socket.emit('messagesRead', { userId: user.userId }); // Notify App.jsx to update unread count
      } catch (err) {
        console.error('Failed to mark messages as read:', err.response?.data);
      }
    };

    if (token) {
      fetchMessages();
      fetchOtherUserName();
      markMessagesAsRead(); // Mark messages as read when conversation loads
    } else {
      console.error('No token available, redirecting to login');
      window.location.href = '/login';
    }

    // Listen for new messages in real-time
    socket.on('newMessage', (message) => {
      if (
        (message.senderId === Number(otherUserId) && message.receiverId === user.userId) ||
        (message.senderId === user.userId && message.receiverId === Number(otherUserId))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Cleanup socket listener
    return () => {
      socket.off('newMessage');
    };
  }, [otherUserId, token, user.userId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = { receiverId: Number(otherUserId), content: newMessage };
      const res = await axios.post('/api/messages', messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([...messages, res.data]);
      socket.emit('sendMessage', res.data); // Emit new message to update other clients
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err.response?.data);
    }
  };

  return (
    <div className="messaging-container">
      <h2>Messages with {otherUserName} (ID: {otherUserId})</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === user?.userId ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
            <span>{new Date(msg.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Messaging;