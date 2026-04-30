import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Restaurant.css";

const CUISINE_EMOJIS = {
  Burger: "🍔", Pizza: "🍕", Biryani: "🍗", Sushi: "🍣",
  Noodles: "🍜", Tacos: "🌮", Desserts: "🍰", Salads: "🥗",
};

// Demo menu when backend returns empty
const DEMO_MENU = [
  { _id: "m1", name: "Classic Smash Burger", description: "Double smash patty with cheddar, pickles and house sauce", price: 249, category: "Burgers", isVeg: false, isAvailable: true },
  { _id: "m2", name: "BBQ Bacon Burger", description: "Smoky BBQ sauce, crispy bacon, caramelized onions", price: 299, category: "Burgers", isVeg: false, isAvailable: true },
  { _id: "m3", name: "Veggie Delight", description: "Plant-based patty with fresh lettuce and tomato", price: 199, category: "Burgers", isVeg: true, isAvailable: true },
  { _id: "m4", name: "Crispy Fries", description: "Golden crispy fries with our signature seasoning", price: 99, category: "Sides", isVeg: true, isAvailable: true },
  { _id: "m5", name: "Onion Rings", description: "Beer-battered onion rings, golden and crispy", price: 119, category: "Sides", isVeg: true, isAvailable: false },
  { _id: "m6", name: "Chocolate Shake", description: "Rich creamy chocolate milkshake", price: 149, category: "Drinks", isVeg: true, isAvailable: true },
  { _id: "m7", name: "Strawberry Lemonade", description: "Fresh strawberry lemonade, served chilled", price: 129, category: "Drinks", isVeg: true, isAvailable: true },
];

function MenuItemCard({ item, qty, onAdd, onInc, onDec }) {
  return (
    <div className={`menu-item-card ${!item.isAvailable ? "out-of-stock" : ""}`}>
      <div className="menu-item-info">
        <div className="menu-item-header">
          <span className={`veg-badge ${item.isVeg ? "veg" : "non-veg"}`}>
            <span className="veg-dot"></span>
          </span>
          <h4 className="menu-item-name">{item.name}</h4>
        </div>
        <p className="menu-item-desc">{item.description}</p>
        <div className="menu-item-price">₹{item.price}</div>
      </div>
      <div className="menu-item-action">
        {item.image && (
          <img src={item.image} alt={item.name} className="menu-item-img" />
        )}
        {!item.image && (
          <div className="menu-item-img-placeholder">🍽️</div>
        )}
        {!item.isAvailable ? (
          <div className="out-of-stock-btn">Out of Stock</div>
        ) : qty === 0 ? (
          <button className="add-btn" onClick={() => onAdd(item)}>ADD +</button>
        ) : (
          <div className="qty-controls">
            <button className="qty-btn" onClick={() => onDec(item._id)}>−</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => onInc(item._id)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, cartTotal, cartCount } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuByCategory, setMenuByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch restaurant
        const rRes = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const rData = await rRes.json();
        setRestaurant(rData);

        // Fetch menu
        const mRes = await fetch(`http://localhost:5000/api/menu?restaurant=${id}`);
        const mData = await mRes.json();
        const items = Array.isArray(mData) && mData.length > 0 ? mData : DEMO_MENU;
        groupByCategory(items);
      } catch {
        setRestaurant({ name: "The Burger Lab", cuisine: "Burger", rating: 4.8, deliveryTime: "25-30 min", deliveryFee: 30 });
        groupByCategory(DEMO_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const groupByCategory = (items) => {
    const grouped = {};
    items.forEach(item => {
      const cat = item.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    setMenuByCategory(grouped);
    setActiveSection(Object.keys(grouped)[0] || "");
  };

  const getItemQty = (itemId) => {
    const found = cartItems.find(i => i._id === itemId);
    return found ? found.qty : 0;
  };

  const handleInc = (itemId) => {
    const found = cartItems.find(i => i._id === itemId);
    if (found) updateQty(itemId, found.qty + 1);
  };

  const handleDec = (itemId) => {
    const found = cartItems.find(i => i._id === itemId);
    if (found) updateQty(itemId, found.qty - 1);
  };

  const scrollToSection = (cat) => {
    setActiveSection(cat);
    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="restaurant-loading">
        <div className="restaurant-loading-spinner"></div>
        <p>Loading menu…</p>
      </div>
    );
  }

  const categories = Object.keys(menuByCategory);

  return (
    <div className="restaurant-page">
      {/* Header */}
      <div className="restaurant-hero">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="restaurant-hero-info">
          <div className="restaurant-hero-emoji">
            {CUISINE_EMOJIS[restaurant?.cuisine] || "🍽️"}
          </div>
          <div>
            <h1 className="restaurant-hero-name">{restaurant?.name || "Restaurant"}</h1>
            <div className="restaurant-hero-meta">
              <span>⭐ {restaurant?.rating || "4.5"}</span>
              <span className="dot">·</span>
              <span>🕐 {restaurant?.deliveryTime || "30-40 min"}</span>
              <span className="dot">·</span>
              <span>{restaurant?.deliveryFee === 0 ? "🎉 Free delivery" : `₹${restaurant?.deliveryFee || 30} delivery`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="restaurant-body">
        {/* Category nav tabs */}
        <div className="category-tabs-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab-btn ${activeSection === cat ? "active" : ""}`}
              onClick={() => scrollToSection(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="restaurant-content">
          {/* Menu list */}
          <div className="menu-sections">
            {categories.map(cat => (
              <div key={cat} id={`cat-${cat}`} className="menu-category-section">
                <h3 className="menu-category-title">{cat}</h3>
                <div className="menu-items-list">
                  {menuByCategory[cat].map(item => (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      qty={getItemQty(item._id)}
                      onAdd={addToCart}
                      onInc={handleInc}
                      onDec={handleDec}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky cart sidebar */}
          {cartCount > 0 && (
            <div className="cart-sidebar">
              <div className="cart-sidebar-inner">
                <h3 className="cart-sidebar-title">🛒 Your Order</h3>
                <div className="cart-sidebar-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="cart-sidebar-item">
                      <span className="cart-item-name">{item.name}</span>
                      <div className="cart-item-qty-row">
                        <button className="sidebar-qty-btn" onClick={() => handleDec(item._id)}>−</button>
                        <span>{item.qty}</span>
                        <button className="sidebar-qty-btn" onClick={() => handleInc(item._id)}>+</button>
                      </div>
                      <span className="cart-item-price">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-sidebar-divider"></div>
                <div className="cart-sidebar-total">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <button className="cart-sidebar-cta" onClick={() => navigate("/cart")}>
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom cart bar */}
      {cartCount > 0 && (
        <div className="mobile-cart-bar" onClick={() => navigate("/cart")}>
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} added</span>
          <span>View Cart — ₹{cartTotal} →</span>
        </div>
      )}
    </div>
  );
}
