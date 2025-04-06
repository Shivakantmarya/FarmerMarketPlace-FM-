import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Signup({ setToken, onSignupSuccess }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'buyer', profilePic: null });
  const [error, setError] = useState(null);
   const navigate = useNavigate();
  const handleChange = (e) => {
    if (e.target.name === 'profilePic') {
      setForm({ ...form, profilePic: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('password', form.password);
    formData.append('role', form.role);
    if (form.profilePic) formData.append('profilePic', form.profilePic);

    try {
      const res = await axios.post('/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setError(null);
      console.log('Signup response:', res.data);
      onSignupSuccess(form.username); // Trigger popup
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err.response?.data);
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="auth-input"
              id="signup-username"
            />
            <label htmlFor="signup-username" className="auth-label">Username</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="auth-input"
              id="signup-password"
            />
            <label htmlFor="signup-password" className="auth-label">Password</label>
          </div>
          <div className="input-group">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="auth-input"
              id="role"
            >
              <option value="buyer">Buyer</option>
              <option value="farmer">Farmer</option>
            </select>
            <label htmlFor="role" className="auth-label select-label">Role</label>
          </div>
          <div className="input-group">
            <input
              type="file"
              name="profilePic"
              onChange={handleChange}
              accept="image/*"
              className="auth-input"
              id="signup-profile-pic"
            />
            <label htmlFor="signup-profile-pic" className="auth-label">Profile Picture</label>
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;