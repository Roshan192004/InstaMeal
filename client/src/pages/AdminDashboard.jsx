import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminDashboard.css";

const MOCK_ORDERS = [
  { id: "#ORD-2045", customer: "Rahul Sharma", restaurant: "KFC", amount: "₹450", status: "delivered" },
  { id: "#ORD-2044", customer: "Priya Patel", restaurant: "Burger King", amount: "₹350", status: "in-transit" },
  { id: "#ORD-2043", customer: "Amit Kumar", restaurant: "Pizza Hut", amount: "₹599", status: "preparing" },
  { id: "#ORD-2032", customer: "Sneha", restaurant: "Chaat Kitchen", amount: "₹120", status: "delivered" }
];

const MOCK_RESTAURANTS = [
  { id: 1, name: "KFC", orders: 234, revenue: "₹45,890", rating: 4.5, img: "/burger_cat.png" },
  { id: 2, name: "Burger King", orders: 198, revenue: "₹38,450", rating: 4.3, img: "/burger_cat.png" },
  { id: 3, name: "Pizza Hut", orders: 176, revenue: "₹35,200", rating: 4.4, img: "/pizza_slice.png" },
  { id: 4, name: "Dominos", orders: 165, revenue: "₹32,100", rating: 4.2, img: "/pizza_slice.png" }
];

function AdminDashboard() {
  const location = useLocation();
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.showSignupSuccess) {
      setShowSignupSuccess(true);
      // Remove it from state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      
      setTimeout(() => {
        setShowSignupSuccess(false);
      }, 4000);
    }
  }, [location]);

  return (
    <div className="admin-container">
      {showSignupSuccess && (
        <div className="popup-overlay" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <div className="popup-icon">✓</div>
            <h3>Account Created Successfully!</h3>
            <p>Welcome to instaMeal Admin.</p>
          </div>
        </div>
      )}
      
      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-small">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <circle cx="22" cy="22" r="22" fill="#FF4D00"/>
              <path d="M22 10 L23.5 18 L31.5 19.5 L23.5 21 L22 29 L20.5 21 L12.5 19.5 L20.5 18 Z" fill="white" />
              <path d="M14 11 L14.5 14 L17.5 14.5 L14.5 15 L14 18 L13.5 15 L10.5 14.5 L13.5 14 Z" fill="white" />
            </svg>
          </div>
          <span className="brand-text">instaMeal</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#orders" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Orders
          </a>
          <a href="#restaurants" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Restaurants
          </a>
          <a href="#users" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users
          </a>
          <a href="#analytics" className="sidebar-link active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Analytics
          </a>
          <a href="#settings" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </a>
        </nav>
        
        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search-container">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search orders, restaurants, users..." className="admin-search-input" />
          </div>
          <div className="admin-profile-section">
            <div className="notification-bell">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="notification-dot"></span>
            </div>
            <div className="profile-info">
              <div className="profile-avatar">A</div>
              <div className="profile-text">
                <span className="profile-name">Admin User</span>
                <span className="profile-email">admin@instameal.com</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content-scroll">
          {/* Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon bg-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div className="metric-trend trend-up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="metric-value">₹2,45,890</div>
              <div className="metric-title">Total Revenue</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon bg-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <div className="metric-trend trend-up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="metric-value">1,234</div>
              <div className="metric-title">Total Orders</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon bg-orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div className="metric-trend trend-up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  <span>+3.1%</span>
                </div>
              </div>
              <div className="metric-value">156</div>
              <div className="metric-title">Active Restaurants</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon bg-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="metric-trend trend-down">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                  <span>-2.4%</span>
                </div>
              </div>
              <div className="metric-value">8,945</div>
              <div className="metric-title">Total Users</div>
            </div>
          </div>

          {/* Layout Split: Table and Top List */}
          <div className="admin-content-split">
            
            {/* Orders Table */}
            <div className="admin-table-container">
              <div className="table-header-row">
                <h2>Recent Orders</h2>
                <button className="btn-filter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  Filter
                </button>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>RESTAURANT</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map((order, index) => (
                    <tr key={index}>
                      <td className="fw-700">{order.id}</td>
                      <td>
                        <div className="td-stack">
                          <span>{order.customer.split(' ')[0]}</span>
                          {order.customer.split(' ')[1] && <span>{order.customer.split(' ')[1]}</span>}
                        </div>
                      </td>
                      <td>{order.restaurant}</td>
                      <td className="fw-700">{order.amount}</td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>
                          {order.status === 'delivered' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                          {order.status === 'in-transit' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
                          {order.status === 'preparing' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Restaurants List */}
            <div className="admin-list-container">
              <h2>Top Restaurants</h2>
              <div className="top-restaurants-list">
                {MOCK_RESTAURANTS.map((rest, idx) => (
                  <div key={rest.id} className="top-restaurant-item">
                    <div className="rank">{idx + 1}</div>
                    <img src={rest.img} alt={rest.name} className="rest-avatar" />
                    <div className="rest-info">
                      <div className="rest-name">{rest.name}</div>
                      <div className="rest-orders">{rest.orders} orders</div>
                    </div>
                    <div className="rest-metrics">
                      <div className="rest-rev">{rest.revenue}</div>
                      <div className="rest-rating">
                        <span className="star">⭐</span> {rest.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
