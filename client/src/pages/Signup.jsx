import { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend auth
    console.log("Signup data:", formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="signup-container">
      {showSuccess && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">✓</div>
            <h3>Account Created Successfully!</h3>
            <p>Welcome to instaMeal.</p>
          </div>
        </div>
      )}
      <div className="signup-card">
        <div className="signup-header">
          <div className="brand-logo-signup">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <defs>
                <linearGradient id="logoGrad3" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF4D00"/>
                  <stop offset="100%" stopColor="#FF0080"/>
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="22" fill="url(#logoGrad3)"/>
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
          <h2>Create Account</h2>
          <p>Join instaMeal and start ordering delicious food!</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="John Doe" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="john@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="••••••••" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-signup">Create Account</button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/signin" className="signin-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
