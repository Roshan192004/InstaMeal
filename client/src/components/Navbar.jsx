import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div className="brand-logo">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <defs>
                <linearGradient id="logoGrad2" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF4D00"/>
                  <stop offset="100%" stopColor="#FF0080"/>
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="22" fill="url(#logoGrad2)"/>
              <path d="M22 10 L23.5 18 L31.5 19.5 L23.5 21 L22 29 L20.5 21 L12.5 19.5 L20.5 18 Z" fill="white" />
              <path d="M14 11 L14.5 14 L17.5 14.5 L14.5 15 L14 18 L13.5 15 L10.5 14.5 L13.5 14 Z" fill="white" />
            </svg>
          </div>
          <span className="brand-name">instaMeal</span>
        </Link>
      </div>

      <div className="navbar-actions">
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <a href="#menu" className="nav-link">Menu</a>
          <a href="#cities" className="nav-link">Cities</a>
          <a href="#about" className="nav-link">About</a>
          {user && (
            <Link to="/orders" className="nav-link">Orders</Link>
          )}
        </div>

        <div className="auth-buttons">
          {/* Cart icon */}
          <Link to="/cart" className="cart-nav-btn" id="nav-cart-btn" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 9 ? "9+" : cartCount}</span>
            )}
          </Link>

          {user ? (
            <>
              <span className="user-name-nav">👋 {user.name?.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-signin" id="nav-logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-signin" id="nav-signin-btn" style={{ textDecoration: "none" }}>Sign In</Link>
              <Link to="/signup" className="btn-signup-nav" id="nav-signup-btn" style={{ textDecoration: "none" }}>Sign Up</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu toggle">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
