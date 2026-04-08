import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
            {/* Fork */}
            <line x1="14" y1="10" x2="14" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="10" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="10" x2="16" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="20" x2="14" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            {/* Knife */}
            <line x1="22" y1="10" x2="22" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 10 Q28 14 26 20 L22 20Z" fill="white" opacity="0.9"/>
            {/* Sparkle */}
            <path d="M31 12 L32 15 L35 16 L32 17 L31 20 L30 17 L27 16 L30 15Z" fill="white"/>
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
          <Link to="/signin" className="btn-signin" style={{ textDecoration: 'none' }}>Sign In</Link>
          <Link to="/signup" className="btn-signup-nav" style={{ textDecoration: 'none' }}>Sign Up</Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
