import React from 'react';
import Navbar from '../components/Navbar';
import './Order.css';

const Order = () => {
  return (
    <div className="order-page">
      <Navbar />
      <div className="order-container">
        <div className="order-content">
          <div className="order-icon">🛒</div>
          <h1>Your Order Page</h1>
          <p>This is where your delicious journey begins. Start exploring our menu to add items here!</p>
          <div className="order-actions">
            <button className="btn-primary" onClick={() => window.location.href = '/'}>Go Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
