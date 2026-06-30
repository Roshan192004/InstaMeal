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
    <div className={`rest-item-card ${!item.isAvailable ? "out-of-stock" : ""}`}>
      <div className="rest-item-info">
        <div className="rest-item-header">
          <span className={`veg-badge ${item.isVeg ? "veg" : "non-veg"}`}>
            <span className="veg-dot"></span>
          </span>
          <h4 className="rest-item-name">{item.name}</h4>
        </div>
        <p className="rest-item-desc">{item.description}</p>
        <div className="rest-item-price">₹{item.price}</div>
      </div>
      <div className="rest-item-action">
        {item.image && (
          <img src={item.image} alt={item.name} className="rest-item-img" />
        )}
        {!item.image && (
          <div className="rest-item-img-placeholder">🍽️</div>
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
  const [allMenu, setAllMenu] = useState([]);
  const [menuByCategory, setMenuByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  
  // New State for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [pureVegOnly, setPureVegOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rRes = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const rData = await rRes.json();
        setRestaurant(rData);

        const mRes = await fetch(`http://localhost:5000/api/menu?restaurant=${id}`);
        const mData = await mRes.json();
        const items = Array.isArray(mData) && mData.length > 0 ? mData : DEMO_MENU;
        setAllMenu(items);
      } catch {
        setRestaurant({ name: "The Burger Lab", cuisine: "Burger", rating: 4.8, deliveryTime: "25-30 min", deliveryFee: 30, minimumOrder: 150 });
        setAllMenu(DEMO_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!allMenu.length) return;
    const grouped = {};
    allMenu.forEach(item => {
      if (pureVegOnly && !item.isVeg) return;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return;

      const cat = item.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    setMenuByCategory(grouped);
  }, [allMenu, pureVegOnly, searchQuery]);

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
      <div className="restaurant-container">
        
        {/* Breadcrumb / Back */}
        <div className="restaurant-breadcrumb">
          <span onClick={() => navigate(-1)}>Home</span> / {restaurant?.name}
        </div>

        {/* Clean Header */}
        <div className="restaurant-header">
          <h1 className="restaurant-title">{restaurant?.name || "Restaurant"}</h1>
          <div className="restaurant-tabs">
            <button className="restaurant-tab active">Order Online</button>
            <button className="restaurant-tab">Dineout</button>
          </div>
        </div>

        {/* Info Card */}
        <div className="restaurant-info-card-wrapper">
          <div className="restaurant-info-card">
            {(!restaurant?.isOpen || restaurant?.holidayMode) && (
              <div className="restaurant-alert">
                <span className="alert-icon">i</span> 
                Uh-oh! The outlet is not accepting orders at the moment due to ongoing issue.
              </div>
            )}
            
            <div className="info-card-body">
              <div className="info-rating-row">
                <span className="info-rating">⭐ {restaurant?.rating || "4.5"} (1K+ ratings)</span>
                <span className="info-dot">·</span>
                <span className="info-cost">₹{restaurant?.minimumOrder || 300} for two</span>
              </div>
              
              <div className="info-cuisines">
                {restaurant?.categories?.join(", ") || restaurant?.cuisine || "North Indian, Fast Food"}
              </div>

              <div className="info-location">
                <div className="location-timeline">
                  <div className="timeline-dot top"></div>
                  <div className="timeline-line"></div>
                  <div className="timeline-dot bottom"></div>
                </div>
                <div className="location-details">
                  <div className="outlet-row">
                    <strong>Outlet</strong> <span>{restaurant?.address || "Location not provided"}</span>
                  </div>
                  <div className="status-row">
                    <strong>{(restaurant?.isOpen && !restaurant?.holidayMode) ? (restaurant?.deliveryTime || "30-40 min") : "Closed & not delivering"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Divider & Search */}
        <div className="menu-divider">
          <span>~</span> MENU <span>~</span>
        </div>

        <div className="menu-controls">
          <div className="search-bar-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" className="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search for dishes" 
              className="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            className={`veg-toggle-btn ${pureVegOnly ? "active" : ""}`}
            onClick={() => setPureVegOnly(!pureVegOnly)}
          >
            <span className="veg-icon"></span> Pure Veg
          </button>
        </div>

        {/* Menu Content */}
        <div className="restaurant-content">
          <div className="menu-sections">
            {categories.length === 0 ? (
              <div className="empty-menu-msg">
                No items found matching your search.
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat} id={`cat-${cat}`} className="menu-category-section">
                  <h3 className="menu-category-title">{cat}</h3>
                  <div className="rest-items-list">
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
              ))
            )}
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
