import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LocationSidebar from './LocationSidebar';
import './OrderNavbar.css';

const OrderNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useState({
    type: "HOME",
    addr: "Khajurla, Punjab 144411, India"
  });

  const handleSelectAddress = (newLoc) => {
    setLocation(newLoc);
  };

  return (
    <>
      <nav className="order-navbar">
      <div className="order-navbar-container">
        {/* Logo & Location */}
        <div className="on-left">
          <Link to="/" className="on-brand">
            <svg viewBox="0 0 44 44" fill="none" width="34" height="34">
              <defs>
                <linearGradient id="logoGradNav" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF4D00"/>
                  <stop offset="100%" stopColor="#FF0080"/>
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="22" fill="url(#logoGradNav)"/>
              <path d="M22 10 L23.5 18 L31.5 19.5 L23.5 21 L22 29 L20.5 21 L12.5 19.5 L20.5 18 Z" fill="white" />
            </svg>
          </Link>
          <div className="on-location" onClick={() => setIsSidebarOpen(true)}>
            <span className="location-type">{location.type}</span>
            <span className="location-addr">{location.addr}</span>
            <svg className="dropdown-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fc8019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="on-center">
          <div className="on-nav-item on-search">
            <svg className="on-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className="on-label">Search</span>
          </div>
          <div className="on-nav-item">
            <svg className="on-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
            </svg>
            <span className="on-label">Help</span>
          </div>
          <div className="on-nav-item">
            <svg className="on-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="on-label">Roshan P...</span>
          </div>
          <div className="on-nav-item on-cart">
            <div className="cart-icon-container">
              <svg className="on-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-count">0</span>
            </div>
            <span className="on-label">Cart</span>
          </div>
        </div>
      </div>
      <LocationSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectAddress={handleSelectAddress}
      />
    </>
  );
};

export default OrderNavbar;
