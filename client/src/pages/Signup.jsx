import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer"
  });

  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Basic frontend validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save token to local storage 
      localStorage.setItem("token", data.token);

      // Redirection logic based on role. We pass a state flag so the destination can show the success message.
      if (data.role === "admin") {
        navigate("/admin", { state: { showSignupSuccess: true } });
      } else {
        navigate("/", { state: { showSignupSuccess: true } });
      }
      
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="signup-container">
      {errorMsg && (
        <div className="error-banner">
          {errorMsg}
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

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="role-select"
            >
              <option value="customer">Customer</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
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
