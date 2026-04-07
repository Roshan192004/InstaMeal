import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
            <path d="M12 20 Q20 10 28 20 Q20 30 12 20Z" fill="white" opacity="0.9"/>
            <circle cx="20" cy="20" r="4" fill="white"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#FF4D00"/>
                <stop offset="100%" stopColor="#FF0080"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="brand-name">instaMeal</span>
      </div>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <a href="#menu" className="nav-link">Menu</a>
        <a href="#cities" className="nav-link">Cities</a>
        <a href="#about" className="nav-link">About</a>
      </div>

      <div className="navbar-actions">
        <button className="btn-signin">Sign In</button>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
