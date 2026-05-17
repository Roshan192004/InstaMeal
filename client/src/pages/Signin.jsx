import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signin.css";

// TODO: Replace with your Firebase config
// import { initializeApp } from "firebase/app";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// const firebaseApp = initializeApp({ apiKey: "...", authDomain: "...", projectId: "..." });
// const auth = getAuth(firebaseApp);

function Signin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState("email"); // "email" | "phone"

  // Email/Password state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      login(data);
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "rider") navigate("/rider");
      else navigate("/");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleSendOTP = async () => {
    setErrorMsg("");
    if (!phone || phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number");
      return;
    }
    setPhoneLoading(true);
    try {
      // TODO: Replace with real Firebase OTP when Firebase is configured:
      // window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      // const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier);
      // setConfirmationResult(result);

      // STUB: Simulate OTP sent for development
      await new Promise(r => setTimeout(r, 1000));
      setOtpSent(true);
      alert("OTP sent! (Dev mode: use any 6-digit code)");
    } catch (err) {
      setErrorMsg("Failed to send OTP. Try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setErrorMsg("");
    if (!otp || otp.length !== 6) {
      setErrorMsg("Enter the 6-digit OTP");
      return;
    }
    setPhoneLoading(true);
    try {
      // TODO: With real Firebase:
      // const result = await confirmationResult.confirm(otp);
      // const idToken = await result.user.getIdToken();
      // Then call backend with idToken

      // STUB: Call backend directly in dev mode
      const response = await fetch("http://localhost:5000/api/auth/phone-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, idToken: "dev_stub_token" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed");
      login(data);
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {errorMsg && <div className="error-banner">{errorMsg}</div>}
      <div id="recaptcha-container"></div>

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
              <line x1="14" y1="10" x2="14" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="10" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="10" x2="16" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="20" x2="14" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="22" y1="10" x2="22" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 10 Q28 14 26 20 L22 20Z" fill="white" opacity="0.9"/>
              <path d="M31 12 L32 15 L35 16 L32 17 L31 20 L30 17 L27 16 L30 15Z" fill="white"/>
            </svg>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your instaMeal account to continue.</p>
        </div>

        {/* Tab switcher */}
        <div className="signin-tabs">
          <button
            className={`signin-tab ${tab === "email" ? "active" : ""}`}
            onClick={() => { setTab("email"); setErrorMsg(""); }}
            type="button"
          >
            📧 Email
          </button>
          <button
            className={`signin-tab ${tab === "phone" ? "active" : ""}`}
            onClick={() => { setTab("phone"); setErrorMsg(""); }}
            type="button"
          >
            📱 Phone OTP
          </button>
        </div>

        {tab === "email" ? (
          <form className="signin-form" onSubmit={handleEmailSubmit}>
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
        ) : (
          <div className="signin-form">
            {!otpSent ? (
              <div className="form-group">
                <label htmlFor="phone-input">Phone Number</label>
                <div className="phone-input-row">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="phone-input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
                <button
                  type="button"
                  className="btn-signin-submit"
                  onClick={handleSendOTP}
                  disabled={phoneLoading}
                  style={{ marginTop: "1rem" }}
                >
                  {phoneLoading ? "Sending…" : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="otp-input">Enter OTP</label>
                <p className="otp-hint">OTP sent to +91 {phone}</p>
                <input
                  type="text"
                  id="otp-input"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="otp-input"
                />
                <button
                  type="button"
                  className="btn-signin-submit"
                  onClick={handleVerifyOTP}
                  disabled={phoneLoading}
                  style={{ marginTop: "1rem" }}
                >
                  {phoneLoading ? "Verifying…" : "Verify OTP"}
                </button>
                <button type="button" className="resend-btn" onClick={() => setOtpSent(false)}>
                  ← Change number
                </button>
              </div>
            )}
          </div>
        )}

        <div className="signin-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
