// import React, { useState, useEffect, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import io from 'socket.io-client';
// import jwtDecode from 'jwt-decode';
// import ProductList from './components/ProductList';
// import Cart from './components/Cart';
// import Login from './components/Login';
// import Signup from './components/Signup';
// import Messaging from './components/Messaging';
// import './App.css';

// axios.defaults.baseURL = 'http://localhost:5000';

// const socket = io('http://localhost:5000');

// function App() {
//   const [token, setToken] = useState(localStorage.getItem('token') || '');
//   const [products, setProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [form, setForm] = useState({ name: '', price: '', quantity: '', image: null });
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [messageSenders, setMessageSenders] = useState([]);
//   const [showIntro, setShowIntro] = useState(true);
//   const navigate = useNavigate();

//   const user = useMemo(() => (token ? jwtDecode(token) : null), [token]);

//   // Intro useEffect
//   useEffect(() => {
//     console.log('Intro useEffect running - showIntro:', showIntro, 'token:', token);
//     const introTimer = setTimeout(() => {
//       console.log('Intro timer fired - setting showIntro to false');
//       setShowIntro(false);
//       if (!token) {
//         console.log('No token, navigating to /login');
//         navigate('/login');
//       } else {
//         console.log('Token exists, staying on main page');
//       }
//     }, 3000);

//     return () => {
//       console.log('Cleaning up intro useEffect');
//       clearTimeout(introTimer);
//     };
//   }, [token, navigate]);

//   // Fetch products once on mount or token change
//   useEffect(() => {
//     console.log('Products useEffect running - token:', token);
//     axios.get('/api/products')
//       .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
//       .catch(err => setError('Failed to load products'));
//   }, [token]);

//   // Socket listeners for real-time updates
//   useEffect(() => {
//     console.log('Socket useEffect running - token:', token, 'showIntro:', showIntro);
//     socket.on('productsUpdated', (updatedProducts) => {
//       setProducts(prev => {
//         // Only update if different to prevent unnecessary re-renders
//         if (JSON.stringify(prev) !== JSON.stringify(updatedProducts)) {
//           console.log('Products updated via socket:', updatedProducts);
//           return updatedProducts;
//         }
//         return prev;
//       });
//     });

//     socket.on('messagesRead', ({ userId }) => {
//       if (user && user.userId === userId) {
//         console.log('Received messagesRead event for user:', userId);
//         fetchUnreadCount();
//       }
//     });

//     socket.on('sendMessage', (message) => {
//       if (user && message.receiverId === user.userId) {
//         console.log('New message received for user:', user.userId);
//         fetchUnreadCount();
//       }
//     });

//     return () => {
//       console.log('Cleaning up socket useEffect');
//       socket.off('productsUpdated');
//       socket.off('messagesRead');
//       socket.off('sendMessage');
//     };
//   }, [token, user]); // Removed showIntro and messageSenders.length

//   // Fetch message data once after intro
//   useEffect(() => {
//     const fetchUnreadCount = async () => {
//       try {
//         const res = await axios.get('/api/messages/unread/count', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUnreadCount(res.data.unreadCount);
//       } catch (err) {
//         console.error('Failed to fetch unread count:', err.response?.data);
//         if (err.response?.status === 401) {
//           logout();
//           navigate('/login');
//         }
//       }
//     };

//     const fetchMessageSenders = async () => {
//       try {
//         console.log('Fetching senders with token:', token);
//         const res = await axios.get('/api/messages/senders', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log('Message senders fetched:', res.data);
//         setMessageSenders(res.data);
//       } catch (err) {
//         console.error('Failed to fetch senders:', err.response?.data);
//         if (err.response?.status === 401) {
//           logout();
//           navigate('/login');
//         }
//       }
//     };

//     if (token && !showIntro) {
//       console.log('Fetching message data - token:', token, 'showIntro:', showIntro);
//       fetchUnreadCount();
//       fetchMessageSenders();
//     }
//   }, [token, showIntro, navigate]); // Removed messageSenders.length to break loop

//   const handleChange = (e) => {
//     if (e.target.name === 'image') {
//       setForm({ ...form, image: e.target.files[0] });
//     } else {
//       setForm({ ...form, [e.target.name]: e.target.value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('name', form.name);
//     formData.append('price', form.price);
//     formData.append('quantity', form.quantity);
//     if (form.image) formData.append('image', form.image);

//     try {
//       const res = await axios.post('/api/products', formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       setProducts([...products, res.data]);
//       setForm({ name: '', price: '', quantity: '', image: null });
//       socket.emit('productAdded');
//     } catch (err) {
//       console.error('Add product error:', err.response?.data);
//       setError(err.response?.data?.message || 'Failed to add product');
//       if (err.response?.status === 401) {
//         logout();
//         navigate('/login');
//       }
//     }
//   };

//   const addToCart = (product) => setCart([...cart, { ...product, quantity: 1 }]);
//   const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
//   const checkout = () => {
//     alert('Checkout successful! (Placeholder)');
//     setCart([]);
//   };

//   const logout = () => {
//     setToken('');
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   const sidebarHeaderText = user?.role === 'buyer' ? 'BUYER' : 'SELLER';
//   const sidebarClass = user?.role === 'buyer' ? 'buyer' : 'seller';

//   // Hoist fetchUnreadCount for socket listeners
//   const fetchUnreadCount = async () => {
//     try {
//       const res = await axios.get('/api/messages/unread/count', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUnreadCount(res.data.unreadCount);
//     } catch (err) {
//       console.error('Failed to fetch unread count:', err.response?.data);
//       if (err.response?.status === 401) {
//         logout();
//         navigate('/login');
//       }
//     }
//   };

//   if (showIntro) {
//     return (
//       <div className="intro-container">
//         <span className="intro-logo">
//           <span className="fm-f">F</span>
//           <span className="fm-m">M</span>
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className="app-container">
//       <nav>
//         <div className="container">
//           <Link to="/" className="logo">
//             <span className="fm-logo">
//               <span className="fm-f">F</span>
//               <span className="fm-m">M</span>
//             </span>
//             <span className="logo-text">Farmer Marketplace</span>
//           </Link>
//           <div className="links">
//             {token ? (
//               <>
//                 <Link to="/">Home</Link>
//                 <button onClick={logout}>Logout</button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login">Login</Link>
//                 <Link to="/signup">Signup</Link> 
//               </>
//             )}
//           </div>
//         </div>
//       </nav>

//       <div className="layout">
//         {token && (
//           <aside className="sidebar">
//             <h3 className={sidebarClass}>
//               <span className="fm-logo">
//                 <span className="fm-f">F</span>
//                 <span className="fm-m">M</span>
//               </span>
//               {sidebarHeaderText}
//             </h3>
//             {user?.profilePic && (
//               <img
//                 src={`http://localhost:5000${user.profilePic}`}
//                 alt="Profile"
//                 className="profile-pic"
//               />
//             )}
//             <p>User Name: <span className="username">{user?.username?.toUpperCase()}</span></p>
//             <p>User ID: {user?.userId}</p>
//             <div>
//               <p>Messages {unreadCount > 0 && <span className="unread-count">({unreadCount} unread)</span>}</p>
//               {messageSenders.length > 0 ? (
//                 messageSenders.map(sender => (
//                   <p key={sender.userId}>
//                     <Link to={`/messages/${sender.userId}`}>
//                       {sender.username} (ID: {sender.userId})
//                     </Link>
//                   </p>
//                 ))
//               ) : (
//                 <p>No conversations yet</p>
//               )}
//             </div>
//           </aside>
//         )}
//         <main className={`main-content ${!token ? 'auth-main' : ''}`}>
//           <Routes>
//             <Route
//               path="/"
//               element={
//                 <div className="main-container">
//                   {token && (
//                     <div className="form-section">
//                       <h2>Add Product (Farmers)</h2>
//                       <form onSubmit={handleSubmit}>
//                         <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required />
//                         <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required />
//                         <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" required />
//                         <input name="image" type="file" onChange={handleChange} accept="image/*" />
//                         <button type="submit">Add Product</button>
//                       </form>
//                     </div>
//                   )}
//                   <div>
//                     {error && <p className="error">{error}</p>}
//                     <ProductList products={products} addToCart={addToCart} user={user} />
//                     <Cart cart={cart} removeFromCart={removeFromCart} checkout={checkout} />
//                   </div>
//                 </div>
//               }
//             />
//             <Route path="/login" element={<Login setToken={setToken} />} />
//             <Route path="/signup" element={<Signup setToken={setToken} />} />
//             <Route path="/messages/:otherUserId" element={<Messaging user={user} />} />
//           </Routes>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default function AppWrapper() {
//   return (
//     <Router>
//       <App />
//     </Router>
//   );
// }






import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Signup from './components/Signup';
import Messaging from './components/Messaging';
import './App.css';
import chat from './assets/bubble-chat.png';

axios.defaults.baseURL = 'http://localhost:5000';

const socket = io('http://localhost:5000');

let hasShownIntro = false;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', quantity: '', image: null });
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageSenders, setMessageSenders] = useState([]);
  const [showIntro, setShowIntro] = useState(!hasShownIntro);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  const user = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded user:', decoded);
      return decoded;
    } catch (err) {
      console.error('JWT decode error:', err.message);
      setToken('');
      localStorage.removeItem('token');
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!showIntro || hasShownIntro) return;

    console.log('Intro useEffect running - showIntro:', showIntro, 'token:', token);
    const introTimer = setTimeout(() => {
      console.log('Intro timer fired - setting showIntro to false');
      setShowIntro(false);
      hasShownIntro = true;
      if (!token && window.location.pathname === '/') {
        console.log('No token on initial load, navigating to /login');
        navigate('/login');
      }
    }, 3000);

    return () => {
      console.log('Cleaning up intro useEffect');
      clearTimeout(introTimer);
    };
  }, [showIntro, token, navigate]);

  useEffect(() => {
    if (showPopup) {
      console.log('Popup triggered:', popupMessage);
      navigate('/'); // Navigate to home immediately
      const popupTimer = setTimeout(() => {
        console.log('Popup timeout - hiding popup');
        setShowPopup(false);
      }, 3000); // Hide popup after 3 seconds
      return () => clearTimeout(popupTimer);
    }
  }, [showPopup, navigate]);

  useEffect(() => {
    console.log('Products useEffect running - token:', token);
    axios.get('/api/products')
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError('Failed to load products'));
  }, [token]);

  useEffect(() => {
    console.log('Socket useEffect running - token:', token);
    socket.on('productsUpdated', (updatedProducts) => {
      setProducts(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(updatedProducts)) {
          console.log('Products updated via socket:', updatedProducts);
          return updatedProducts;
        }
        return prev;
      });
    });

    socket.on('messagesRead', ({ userId }) => {
      if (user && user.userId === userId) {
        console.log('Received messagesRead event for user:', userId);
        fetchUnreadCount();
      }
    });

    socket.on('sendMessage', (message) => {
      if (user && message.receiverId === user.userId) {
        console.log('New message received for user:', user.userId);
        fetchUnreadCount();
      }
    });

    return () => {
      console.log('Cleaning up socket useEffect');
      socket.off('productsUpdated');
      socket.off('messagesRead');
      socket.off('sendMessage');
    };
  }, [token, user]);

  useEffect(() => {
    const fetchMessageData = async () => {
      try {
        console.log('Fetching message data - token:', token);
        const [unreadRes, sendersRes] = await Promise.all([
          axios.get('/api/messages/unread/count', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/messages/senders', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUnreadCount(unreadRes.data.unreadCount);
        console.log('Message senders fetched:', sendersRes.data);
        setMessageSenders(sendersRes.data);
      } catch (err) {
        console.error('Failed to fetch message data:', err.response?.data);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    if (token && !showIntro) {
      fetchMessageData();
    }
  }, [token, showIntro, navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('quantity', form.quantity);
    if (form.image) formData.append('image', form.image);

    try {
      const res = await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProducts([...products, res.data]);
      setForm({ name: '', price: '', quantity: '', image: null });
      socket.emit('productAdded');
    } catch (err) {
      console.error('Add product error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to add product');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const addToCart = (product) => setCart([...cart, { ...product, quantity: 1 }]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const checkout = () => {
    alert('Checkout successful! (Placeholder)');
    setCart([]);
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err.response?.data);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const handleSignupSuccess = (username) => {
    console.log('Signup success for:', username);
    setPopupMessage(`Congratulations ${username}, signed successfully`);
    setShowPopup(true);
    navigate('/');
  };

  const sidebarHeaderText = user?.role === 'buyer' ? 'BUYER' : 'SELLER';
  const sidebarClass = user?.role === 'buyer' ? 'buyer' : 'seller';

  console.log('Rendering App - token:', token, 'showPopup:', showPopup);

  if (showIntro) {
    return (
      <div className="intro-container">
        <span className="intro-logo">
          <span className="fm-f">F</span>
          <span className="fm-m">M</span>
        </span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav>
        <div className="container">
          <Link to="/" className="logo">
            <span className="fm-logo">
              <span className="fm-f">F</span>
              <span className="fm-m">M</span>
            </span>
            <span className="logo-text">Farmer Marketplace</span>
          </Link>
          <div className="links">
            {token ? (
              <>
                <Link to="/">Home</Link>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="layout">
        {showPopup && (
          <div className="signup-popup">
            {popupMessage}
          </div>
        )}
        {token ? (
          <aside className="sidebar">
            <h3 className={sidebarClass}>
              <span className="fm-logo">
                <span className="fm-f">F</span>
                <span className="fm-m">M</span>
              </span>
              {sidebarHeaderText}
            </h3>
            {user?.profilePic && (
              <img
                src={`http://localhost:5000${user.profilePic}`}
                alt="Profile"
                className="profile-pic"
              />
            )}
            <p>User Name: <span className="username">{user?.username?.toUpperCase() || 'N/A'}</span></p>
            <p>User ID: {user?.userId || 'N/A'}</p>
            <div>
              <p>Messages {unreadCount > 0 && <span className="unread-count">({unreadCount} unread)</span>}</p>
              {messageSenders.length > 0 ? (
                messageSenders.map(sender => (
                  <p key={sender.userId}>
                    <Link to={`/messages/${sender.userId}`}>
                      {sender.username} (ID: {sender.userId}) <img src={chat} alt="chat" style={{ height: "25px", width: "25px" }} /> {unreadCount}
                    </Link>
                  </p>
                ))
              ) : (
                <p>No conversations yet</p>
              )}
            </div>
          </aside>
        ) : (
          <aside className="sidebar-placeholder" />
        )}
        <main className={`main-content ${!token ? 'auth-main' : ''}`}>
          {error && <p className="error">{error}</p>}
          <Routes>
            <Route
              path="/"
              element={
                <div className="main-container">
                  {token && (
                    <div className="form-section">
                      <h2>Add Product (Farmers)</h2>
                      <form onSubmit={handleSubmit}>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required />
                        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required />
                        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" required />
                        <input name="image" type="file" onChange={handleChange} accept="image/*" />
                        <button type="submit">Add Product</button>
                      </form>
                    </div>
                  )}
                  <div>
                    {error && <p className="error">{error}</p>}
                    <ProductList products={products} addToCart={addToCart} user={user} />
                    <Cart cart={cart} removeFromCart={removeFromCart} checkout={checkout} />
                  </div>
                </div>
              }
            />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/signup" element={<Signup setToken={setToken} onSignupSuccess={handleSignupSuccess} />} />
            <Route path="/messages/:otherUserId" element={<Messaging user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}