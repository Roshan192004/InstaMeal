import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import OrderNavbar from "../components/OrderNavbar";
import "./Order.css";

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

export default function Order() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("detecting");
  const [userCity, setUserCity] = useState("");

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
  }, []);

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
    <div className="order-page-wrapper">
      <OrderNavbar />
      
      <main className="order-main">
        <section className="restaurants-section">
          <div className="restaurants-header">
            <div className="header-text">
              <h2 className="restaurants-title">
                {locationStatus === "found"
                  ? `Restaurants near ${userCity}`
                  : "Top Restaurants"}
              </h2>
              <p className="restaurants-sub">
                📍 {userCity || "Detecting..."} — showing closest restaurants
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
                <span className="pill-emoji">{cat.emoji}</span>
                <span className="pill-label">{cat.label}</span>
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
                      ? <img src={r.image.startsWith("http") ? r.image : `http://localhost:5000${r.image}`} alt={r.name} />
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
                    <h3 className="restaurant-name">{r.name}</h3>
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
      </main>
    </div>
  );
}
