import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const ProductList = ({ products, addToCart, user }) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.farmer).includes(search)
  );

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="product-list-section">
      <h2>Available Products</h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or farmer ID..."
      />
      <ul>
        {filteredProducts.map(product => (
          <li key={product._id}>
            <div className="product-info">
              {product.image && (
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <div>
                <h3>{product.name}</h3>
                <p>Rs.{product.price} (Qty: {product.quantity}) by Farmer ID: {product.farmer}</p>
              </div>
            </div>
            <div>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
              {user?.role === 'farmer' && user?.userId === product.farmer && (
                <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              )}
              {user && user.userId !== product.farmer && (
                <Link to={`/messages/${product.farmer}`}>
                  <button>Message Farmer</button>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;