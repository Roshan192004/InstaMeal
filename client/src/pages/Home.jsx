import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.showSignupSuccess) {
      setShowSignupSuccess(true);
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowSignupSuccess(false), 4000);
    }
  }, [location]);

  return (
    <div className="home-wrapper">
      {showSignupSuccess && (
        <div className="popup-overlay" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <div className="popup-icon">✓</div>
            <h3>Account Created Successfully!</h3>
            <p>Welcome to instaMeal.</p>
          </div>
        </div>
      )}
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-emoji">🎉</span>
            <span>Now delivering in 800+ cities</span>
          </div>
          <h1 className="hero-title">
            <span className="gradient-orange">Delicious</span>
            <br />
            <span className="gradient-purple">Food</span>
            <br />
            <span className="text-dark">Delivered to</span>
            <br />
            <span className="text-dark">Your</span>
            <br />
            <span className="text-dark">Doorstep</span>
          </h1>
          <p className="hero-description">
            Experience culinary excellence from 300,000+ restaurants. Fresh ingredients, prepared with love, delivered fast.
          </p>
          <div className="hero-cta">
            <button className="btn-order-now" id="btn-order-now" onClick={() => navigate('/order')}>
              Order Now →
            </button>
            <button className="btn-explore" id="btn-explore-menu" onClick={() => navigate('/order')}>
              Explore Menu
            </button>
          </div>
          <div className="hero-info">
            <div className="info-badge">
              <div className="info-icon orange-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="info-value">30 min</div>
                <div className="info-label">Avg Delivery</div>
              </div>
            </div>
            <div className="info-badge">
              <div className="info-icon pink-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF0080" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div className="info-value">100%</div>
                <div className="info-label">Safe &amp; Fresh</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="food-card food-card-main">
            <div className="rating-badge"><span className="star">⭐</span><span>4.9</span></div>
            <img src="/burger_hero.png" alt="Exploded burger" className="food-img-main" />
          </div>
          <div className="food-card food-card-pizza">
            <img src="/pizza_card.png" alt="Pepperoni pizza" className="food-img-pizza" />
          </div>
          <div className="food-card food-card-dumplings">
            <div className="popular-badge">Popular</div>
            <img src="/dumplings_card.png" alt="Steamed dumplings" className="food-img-dumplings" />
          </div>
          <div className="food-card food-card-sashimi">
            <img src="/sashimi_card.png" alt="Salmon sashimi" className="food-img-sashimi" />
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section" id="stats">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-icon orange-bg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="stat-number orange-text">300K+</div>
            <div className="stat-title">Partner Restaurants</div>
            <div className="stat-subtitle">Serving delicious food daily</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon pink-bg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF0080" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="stat-number pink-text">800+</div>
            <div className="stat-title">Cities Covered</div>
            <div className="stat-subtitle">Expanding every month</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon purple-bg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div className="stat-number purple-text">3B+</div>
            <div className="stat-title">Orders Delivered</div>
            <div className="stat-subtitle">Satisfied customers worldwide</div>
          </div>
        </div>
      </section>

      <button className="help-btn" id="btn-help" aria-label="Help">?</button>
    </div>
  );
}

export default Home;