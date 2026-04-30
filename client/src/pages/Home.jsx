import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const CATEGORIES = [
  { label: "All", emoji: "🍽️" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Biryani", emoji: "🍗" },
  { label: "Burger", emoji: "🍔" },
  { label: "Sushi", emoji: "🍣" },
  { label: "Noodles", emoji: "🍜" },
  { label: "Tacos", emoji: "🌮" },
  { label: "Desserts", emoji: "🍰" },
  { label: "Salads", emoji: "🥗" },
];

// Fallback demo restaurants when backend has none
const DEMO_RESTAURANTS = [
  { _id: "demo1", name: "The Burger Lab", cuisine: "Burger", rating: 4.8, deliveryTime: "25-30 min", deliveryFee: 30, image: null },
  { _id: "demo2", name: "Pizza Palace", cuisine: "Pizza", rating: 4.6, deliveryTime: "30-40 min", deliveryFee: 25, image: null },
  { _id: "demo3", name: "Biryani House", cuisine: "Biryani", rating: 4.9, deliveryTime: "35-45 min", deliveryFee: 0, image: null },
  { _id: "demo4", name: "Sushi Zen", cuisine: "Sushi", rating: 4.7, deliveryTime: "40-50 min", deliveryFee: 50, image: null },
  { _id: "demo5", name: "Noodle Street", cuisine: "Noodles", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: 20, image: null },
  { _id: "demo6", name: "Taco Town", cuisine: "Tacos", rating: 4.4, deliveryTime: "25-35 min", deliveryFee: 30, image: null },
];

const CUISINE_EMOJIS = {
  Burger: "🍔", Pizza: "🍕", Biryani: "🍗", Sushi: "🍣",
  Noodles: "🍜", Tacos: "🌮", Desserts: "🍰", Salads: "🥗",
};

function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card skeleton">
      <div className="skeleton-img"></div>
      <div className="skeleton-content">
        <div className="skeleton-line wide"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line narrow"></div>
      </div>
    </div>
  );
}

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("detecting"); // "detecting"|"found"|"denied"
  const [userCity, setUserCity] = useState("");

  useEffect(() => {
    if (location.state?.showSignupSuccess) {
      setShowSignupSuccess(true);
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowSignupSuccess(false), 4000);
    }
  }, [location]);

  const fetchNearby = useCallback(async (lat, lng, cuisine) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat, lng, radius: 15000 });
      if (cuisine && cuisine !== "All") params.append("cuisine", cuisine);
      const res = await fetch(`http://localhost:5000/api/restaurants/nearby?${params}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRestaurants(data);
      } else {
        // Backend returned empty — show demo data
        const filtered = cuisine && cuisine !== "All"
          ? DEMO_RESTAURANTS.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()))
          : DEMO_RESTAURANTS;
        setRestaurants(filtered);
      }
    } catch {
      const filtered = cuisine && cuisine !== "All"
        ? DEMO_RESTAURANTS.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()))
        : DEMO_RESTAURANTS;
      setRestaurants(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocationStatus("found");
          // Reverse geocode city name (simple approach)
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const d = await r.json();
            setUserCity(d.address?.city || d.address?.town || d.address?.suburb || "Your Area");
          } catch {
            setUserCity("Your Area");
          }
          fetchNearby(latitude, longitude, activeCategory);
        },
        () => {
          setLocationStatus("denied");
          setRestaurants(DEMO_RESTAURANTS);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus("denied");
      setRestaurants(DEMO_RESTAURANTS);
    }
  }, []); // only on mount

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (locationStatus === "found") {
      navigator.geolocation.getCurrentPosition(
        pos => fetchNearby(pos.coords.latitude, pos.coords.longitude, cat),
        () => {
          const filtered = cat !== "All"
            ? DEMO_RESTAURANTS.filter(r => r.cuisine.toLowerCase() === cat.toLowerCase())
            : DEMO_RESTAURANTS;
          setRestaurants(filtered);
        }
      );
    } else {
      const filtered = cat !== "All"
        ? DEMO_RESTAURANTS.filter(r => r.cuisine.toLowerCase() === cat.toLowerCase())
        : DEMO_RESTAURANTS;
      setRestaurants(filtered);
    }
  };

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
            <button className="btn-explore" id="btn-explore-menu" onClick={() => document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' })}>
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

      {/* ===== RESTAURANTS SECTION ===== */}
      <section className="restaurants-section" id="restaurants-section">
        <div className="restaurants-header">
          <div>
            <h2 className="restaurants-title">
              {locationStatus === "found"
                ? `Restaurants near ${userCity}`
                : "Top Restaurants"}
            </h2>
            <p className="restaurants-sub">
              {locationStatus === "detecting"
                ? "📍 Detecting your location…"
                : locationStatus === "denied"
                ? "📍 Enable location for personalized results"
                : `📍 ${userCity} — showing closest restaurants`}
            </p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/search')}>View All →</button>
        </div>

        {/* Category filters */}
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className={`category-pill ${activeCategory === cat.label ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat.label)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        <div className="restaurant-grid">
          {loading
            ? Array(6).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)
            : restaurants.length === 0
            ? (
              <div className="empty-restaurants">
                <p>😔 No restaurants found for this category nearby.</p>
              </div>
            )
            : restaurants.map(r => (
              <div
                key={r._id}
                className="restaurant-card"
                onClick={() => navigate(`/restaurant/${r._id}`)}
              >
                <div className="restaurant-card-img">
                  {r.image
                    ? <img src={r.image} alt={r.name} />
                    : (
                      <div className="restaurant-img-placeholder">
                        <span>{CUISINE_EMOJIS[r.cuisine] || "🍽️"}</span>
                      </div>
                    )}
                  {r.deliveryFee === 0 && (
                    <span className="free-delivery-badge">FREE Delivery</span>
                  )}
                </div>
                <div className="restaurant-card-body">
                  <h3>{r.name}</h3>
                  <p className="restaurant-cuisine">{r.cuisine}</p>
                  <div className="restaurant-meta">
                    <span className="rating-chip">⭐ {r.rating || "4.5"}</span>
                    <span className="dot">·</span>
                    <span className="delivery-time">🕐 {r.deliveryTime || "30-40 min"}</span>
                    <span className="dot">·</span>
                    <span className="delivery-fee">
                      {r.deliveryFee === 0 ? "Free delivery" : `₹${r.deliveryFee} delivery`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </section>

      <button className="help-btn" id="btn-help" aria-label="Help">?</button>
    </div>
  );
}

export default Home;