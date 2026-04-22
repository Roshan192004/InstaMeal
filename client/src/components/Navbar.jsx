import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
            <defs>
              <linearGradient id="logoGrad2" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4D00"/>
                <stop offset="100%" stopColor="#FF0080"/>
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="22" fill="url(#logoGrad2)"/>
            {/* Sparkles / Stars instead of Fork and Knife to match the screenshot better */}
            <path d="M22 10 L23.5 18 L31.5 19.5 L23.5 21 L22 29 L20.5 21 L12.5 19.5 L20.5 18 Z" fill="white" />
            <path d="M14 11 L14.5 14 L17.5 14.5 L14.5 15 L14 18 L13.5 15 L10.5 14.5 L13.5 14 Z" fill="white" />
          </svg>
        </div>
        <span className="brand-name">instaMeal</span>
      </div>

      <div className="navbar-actions">
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <a href="#menu" className="nav-link">Menu</a>
          <a href="#cities" className="nav-link">Cities</a>
          <a href="#about" className="nav-link">About</a>
        </div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="user-name-nav">{user.name}</span>
              <button onClick={logout} className="btn-signin" style={{ background: 'transparent', border: '1px solid #ccc', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-signin" style={{ textDecoration: 'none' }}>Sign In</Link>
              <Link to="/signup" className="btn-signup-nav" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
