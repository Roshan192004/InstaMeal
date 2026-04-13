import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signin.css";

function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Save token to local storage 
      localStorage.setItem("token", data.token);

      // Redirection logic based on role
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="signin-container">
      {errorMsg && (
        <div className="error-banner">
          {errorMsg}
        </div>
      )}
      <div className="signin-card">
        <div className="signin-header">
          <div className="brand-logo-signin">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <defs>
                <linearGradient id="logoGradSignIn" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF4D00"/>
                  <stop offset="100%" stopColor="#FF0080"/>
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="22" fill="url(#logoGradSignIn)"/>
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
          <h2>Welcome Back</h2>
          <p>Sign in to your instaMeal account to continue.</p>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
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
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <a href="#forgot" className="forgot-password">Forgot password?</a>
            </div>
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

          <button type="submit" className="btn-signin-submit">Sign In</button>
        </form>

        <div className="signin-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
