import React from 'react';
import '../App.css';

const Cart = ({ cart, removeFromCart, checkout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-section">
      <h2>Your Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - Rs.{item.price} x {item.quantity}
            <button onClick={() => removeFromCart(index)}>Remove</button>
          </li>
        ))}
      </ul>
      <p className="total">Total: Rs.{total.toFixed(2)}</p>
      {cart.length > 0 && (
        <button className="checkout-btn" onClick={checkout}>Checkout</button>
      )}
    </div>
  );
};

export default Cart;