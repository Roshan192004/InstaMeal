import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './RiderDashboard.css';

const RiderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'profile'
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [availableOrder, setAvailableOrder] = useState(null);
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    aadharNumber: '',
    vehicleRc: '',
    licenseNumber: '',
    accountNumber: '',
    ifscCode: '',
    zone: 'North'
  });

  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: '',
    icon: '✓'
  });

  useEffect(() => {
    fetchRiderProfile();
  }, []);

  const showNotification = (title, message, icon = '✓') => {
    setToast({
      show: true,
      title,
      message,
      icon
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const fetchRiderProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/rider/profile", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setRider(res.data);
      if (res.data.status === "on_delivery") {
        fetchAssignedOrder();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setRider(null); // Needs registration
      } else {
        console.error("Error fetching rider:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/rider/order", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (res.data.order) {
        setOrder(res.data.order);
      }
    } catch (error) {
      console.error("Error fetching assigned order:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        aadharNumber: formData.aadharNumber,
        vehicleRc: formData.vehicleRc,
        licenseNumber: formData.licenseNumber,
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode
        },
        zone: formData.zone
      };
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/rider/register", payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      showNotification("Registration Successful", "Welcome to the delivery team!");
      fetchRiderProfile();
    } catch (error) {
      console.error("Registration error:", error);
      showNotification("Registration Failed", error.response?.data?.message || "Failed to submit application", "❌");
    }
  };

  const toggleStatus = async () => {
    if (rider.status === "on_delivery") return;
    const newStatus = rider.status === "online" ? "offline" : "online";
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/rider/status", { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setRider({ ...rider, status: newStatus });
      showNotification(
        `You are now ${newStatus.toUpperCase()}`,
        newStatus === 'online' ? "Ready to accept incoming delivery orders!" : "Take a break, you won't receive orders."
      );
    } catch (error) {
      console.error("Error toggling status", error);
      showNotification("Status Update Failed", "Could not toggle status", "❌");
    }
  };

  const findOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/rider/available-order", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setAvailableOrder(res.data.order);
      showNotification("Incoming Request", "Review the order details before accepting.", "📦");
    } catch (error) {
      showNotification("No Orders Available", error.response?.data?.message || "Could not find any nearby orders right now.", "🔍");
    }
  };

  const acceptFoundOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/rider/accept-order", { orderId: availableOrder._id }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setOrder(res.data.order);
      setAvailableOrder(null);
      setRider({ ...rider, status: "on_delivery" });
      showNotification("Delivery Accepted!", "Navigate to the restaurant to pick up the order.", "🚚");
    } catch (error) {
      setAvailableOrder(null);
      showNotification("Acceptance Failed", error.response?.data?.message || "Order is no longer available.", "❌");
    }
  };

  const declineFoundOrder = () => {
    setAvailableOrder(null);
  };

  const updateOrderStatus = async (status, deliveryOtp = null) => {
    try {
      const payload = { orderId: order._id, status };
      if (deliveryOtp) payload.deliveryOtp = deliveryOtp;

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/rider/order-status", payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (status === "delivered") {
        setOrder(null);
        setOtp("");
        fetchRiderProfile(); // Refresh earnings and status
        showNotification("Delivery Completed!", "Earnings have been credited to your account.", "🎉");
      } else {
        setOrder({ ...order, status });
        const friendlyMessage = status === "picked_up" ? "Order marked as picked up!" : "Customer notified of your arrival.";
        showNotification("Status Updated", friendlyMessage, "🚴");
      }
    } catch (error) {
      showNotification("Update Failed", error.response?.data?.message || "Error updating order status", "❌");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="rider-loading">
        <div className="loading-spinner"></div>
        <p>Loading Rider Dashboard...</p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="rider-dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="rider-registration">
          <h2>Apply as Delivery Partner</h2>
          <p className="registration-subtitle">Join instaMeal's elite delivery fleet and earn on your own schedule</p>
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label>Aadhar Number</label>
                <input 
                  type="text" placeholder="12-digit Aadhar number" required
                  value={formData.aadharNumber} onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Vehicle RC Number</label>
                <input 
                  type="text" placeholder="e.g. DL 3C AB 1234" required
                  value={formData.vehicleRc} onChange={(e) => setFormData({...formData, vehicleRc: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Driving License</label>
                <input 
                  type="text" placeholder="DL number" required
                  value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Operating Zone</label>
                <select value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})}>
                  <option value="North">North Zone</option>
                  <option value="South">South Zone</option>
                  <option value="East">East Zone</option>
                  <option value="West">West Zone</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', color: '#f1f5f9', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
              Bank Account Details
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number</label>
                <input 
                  type="text" placeholder="Bank account number" required
                  value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input 
                  type="text" placeholder="IFSC code (11 characters)" required
                  value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="register-btn">Submit Application</button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="register-btn" 
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', boxShadow: 'none', marginTop: '0' }}
            >
              Sign Out
            </button>
          </form>
        </div>

        {toast.show && (
          <div className="rider-toast-overlay">
            <div className="rider-toast-content">
              <div className="toast-icon">{toast.icon}</div>
              <h3>{toast.title}</h3>
              <p>{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get first letter of rider name for avatar
  const displayName = rider.user?.name || user?.name || "Rider";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="rider-dashboard-container">
      {/* ===== SIDEBAR ===== */}
      <aside className="rider-sidebar">
        <div className="sidebar-brand-rider">
          <div className="brand-icon">⚡</div>
          <div className="brand-label">instaMeal <span>Rider</span></div>
        </div>

        {/* Profile Section */}
        <div className="rider-profile-card">
          <div className="profile-avatar-rider">{avatarLetter}</div>
          <div className="profile-name-rider">{displayName}</div>
          <div className="profile-email-rider">{rider.user?.email || user?.email || "rider@instameal.com"}</div>
          <div className="profile-role-badge">Verified Partner</div>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav-rider">
          <button 
            className={`sidebar-link-rider ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Dashboard
          </button>
          
          <button 
            className={`sidebar-link-rider ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </button>
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="sidebar-bottom-rider">
          <Link to="/" className="btn-home-rider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>
          
          <button onClick={handleLogout} className="btn-logout-rider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="rider-main">
        {/* Top Header Bar */}
        <header className="rider-topbar">
          <div className="topbar-title">
            <h1>{activeTab === 'dashboard' ? "Rider Dashboard" : "My Profile"}</h1>
            <p>{activeTab === 'dashboard' ? "Manage your active deliveries and track earnings" : "View your registered documents and bank details"}</p>
          </div>
          
          <div className="topbar-actions">
            <div className={`status-pill ${rider.status}`}>
              <div className="status-dot"></div>
              <span>{rider.status.replace("_", " ")}</span>
            </div>
            
            {rider.status !== "on_delivery" && (
              <button className="toggle-btn" onClick={toggleStatus}>
                Go {rider.status === "online" ? "Offline" : "Online"}
              </button>
            )}
          </div>
        </header>

        {/* Scroll Content Area */}
        <div className="rider-content-scroll">
          
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <section className="rider-stats-grid">
                <div className="rider-stat-card">
                  <div className="stat-card-icon earnings">₹</div>
                  <div className="stat-card-label">Total Earnings</div>
                  <div className="stat-card-value">₹{rider.earnings}</div>
                </div>

                <div className="rider-stat-card">
                  <div className="stat-card-icon zone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="stat-card-label">Operating Zone</div>
                  <div className="stat-card-value">{rider.zone}</div>
                </div>

                <div className="rider-stat-card">
                  <div className="stat-card-icon orders">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                  </div>
                  <div className="stat-card-label">Active Orders</div>
                  <div className="stat-card-value">{order ? "1 Active" : "0 Active"}</div>
                </div>

                <div className="rider-stat-card">
                  <div className="stat-card-icon rating">★</div>
                  <div className="stat-card-label">Rider Rating</div>
                  <div className="stat-card-value">4.8 ★</div>
                </div>
              </section>

              {/* Active Delivery Card */}
              <section className="rider-panel-card">
                <h2>Active Delivery Section</h2>
                <p className="panel-subtitle">Accept jobs and track your delivery route here</p>

                <div className="active-order-section">
                  {rider.status === "offline" ? (
                    <div className="no-order-state">
                      <div className="no-order-icon">💤</div>
                      <h3>You are currently offline</h3>
                      <p>Switch your status to Online to start accepting and completing deliveries.</p>
                      <button className="find-order-btn" onClick={toggleStatus}>Go Online</button>
                    </div>
                  ) : rider.status === "online" && !order && !availableOrder ? (
                    <div className="no-order-state">
                      <div className="no-order-icon">🔍</div>
                      <h3>Looking for nearby orders...</h3>
                      <p>When there are restaurants looking to dispatch, you can request an order assignment.</p>
                      <button className="find-order-btn" onClick={findOrder}>Find Available Orders</button>
                    </div>
                  ) : availableOrder ? (
                    <div className="incoming-request-card" style={{ background: '#1c1c24', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
                      <h3 style={{ color: '#FF4D00', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔔</span> Incoming Delivery Request
                      </h3>
                      <div className="delivery-locations">
                        <div className="location-card">
                          <div className="location-card-header">
                            <div className="location-icon pickup">🏪</div>
                            <span className="location-label">Pickup Restaurant</span>
                          </div>
                          <h4>{availableOrder.restaurant?.name || "Partner Restaurant"}</h4>
                          <p>{availableOrder.restaurant?.address?.street || "No address provided"}</p>
                        </div>
                        <div className="location-card">
                          <div className="location-card-header">
                            <div className="location-icon dropoff">📍</div>
                            <span className="location-label">Customer Dropoff</span>
                          </div>
                          <h4>Dropoff Location</h4>
                          <p>{availableOrder.address?.street}, {availableOrder.address?.city}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                        <button className="action-btn btn-success" style={{ flex: 1, padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }} onClick={acceptFoundOrder}>
                          Accept Delivery
                        </button>
                        <button className="action-btn" style={{ flex: 1, background: '#333', color: '#fff', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', border: '1px solid #444' }} onClick={declineFoundOrder}>
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : order ? (
                    <div className="active-delivery-card">
                      {/* Progress Steps */}
                      <div className="delivery-progress">
                        <div className="progress-step">
                          <div className="progress-dot completed">✓</div>
                          <span className="progress-label completed">Accepted</span>
                        </div>
                        <div className={`progress-line ${['picked_up', 'arriving', 'delivered'].includes(order.status) ? 'completed' : 'active'}`}></div>
                        
                        <div className="progress-step">
                          <div className={`progress-dot ${['picked_up', 'arriving', 'delivered'].includes(order.status) ? 'completed' : 'active'}`}>
                            {['picked_up', 'arriving', 'delivered'].includes(order.status) ? '✓' : '2'}
                          </div>
                          <span className={`progress-label ${['picked_up', 'arriving', 'delivered'].includes(order.status) ? 'completed' : 'active'}`}>Pickup</span>
                        </div>
                        <div className={`progress-line ${order.status === 'delivered' ? 'completed' : ['picked_up', 'arriving'].includes(order.status) ? 'active' : ''}`}></div>
                        
                        <div className="progress-step">
                          <div className={`progress-dot ${order.status === 'delivered' ? 'completed' : ['picked_up', 'arriving'].includes(order.status) ? 'active' : ''}`}>
                            {order.status === 'delivered' ? '✓' : '3'}
                          </div>
                          <span className={`progress-label ${order.status === 'delivered' ? 'completed' : ['picked_up', 'arriving'].includes(order.status) ? 'active' : ''}`}>Delivering</span>
                        </div>
                      </div>

                      {/* Locations Grid */}
                      <div className="delivery-locations">
                        <div className="location-card">
                          <div className="location-card-header">
                            <div className="location-icon pickup">🏪</div>
                            <span className="location-label">Pickup Restaurant</span>
                          </div>
                          <h4>{order.restaurant?.name || "Partner Restaurant"}</h4>
                          <p>{order.restaurant?.address?.street || "No address provided"}</p>
                          <p style={{ marginTop: '8px', color: '#FF4D00', fontWeight: '500' }}>📞 {order.restaurant?.phone || "N/A"}</p>
                        </div>

                        <div className="location-card">
                          <div className="location-card-header">
                            <div className="location-icon dropoff">📍</div>
                            <span className="location-label">Customer Dropoff</span>
                          </div>
                          <h4>{order.user?.name || "Customer"}</h4>
                          <p>{order.address?.street}, {order.address?.city}</p>
                          <p style={{ marginTop: '8px', color: '#FF4D00', fontWeight: '500' }}>📞 {order.user?.phone || "N/A"}</p>
                        </div>
                      </div>

                      {/* Order Action Buttons */}
                      <div className="order-actions-bar">
                        {(order.status === "ready_for_pickup" || order.status === "preparing") && (
                          <button className="action-btn btn-primary" onClick={() => updateOrderStatus("picked_up")}>
                            Mark as Picked Up
                          </button>
                        )}
                        
                        {order.status === "picked_up" && (
                          <button className="action-btn btn-primary" onClick={() => updateOrderStatus("arriving")}>
                            Mark as Arrived at Customer
                          </button>
                        )}

                        {(order.status === "picked_up" || order.status === "arriving") && (
                          <div className="otp-input-group">
                            <input 
                              type="text" 
                              placeholder="Enter OTP" 
                              maxLength="4"
                              value={otp} 
                              onChange={(e) => setOtp(e.target.value)}
                            />
                            <button className="action-btn btn-success" onClick={() => updateOrderStatus("delivered", otp)}>
                              Complete Delivery
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </>
          )}

          {activeTab === 'profile' && (
            <section className="rider-panel-card">
              <h2>My Profile & Verification Documents</h2>
              <p className="panel-subtitle">Review your vehicle details, banking information, and verification status</p>
              
              <div className="profile-details-grid">
                <div className="profile-detail-card">
                  <h3>Personal Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{displayName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{rider.user?.email || user?.email || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-value">{rider.user?.phone || user?.phone || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Current Zone</span>
                    <span className="detail-value">{rider.zone}</span>
                  </div>
                </div>

                <div className="profile-detail-card">
                  <h3>Verification & Banking</h3>
                  <div className="detail-row">
                    <span className="detail-label">Aadhar Card Verification</span>
                    <span className="detail-value verified">✓ Verified ({rider.aadharNumber})</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Driving License</span>
                    <span className="detail-value verified">✓ Verified ({rider.licenseNumber})</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle Registration RC</span>
                    <span className="detail-value verified">✓ Verified ({rider.vehicleRc})</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bank Account Number</span>
                    <span className="detail-value">{rider.bankDetails?.accountNumber || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bank IFSC Code</span>
                    <span className="detail-value">{rider.bankDetails?.ifscCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Toast Notification Pop-up */}
      {toast.show && (
        <div className="rider-toast-overlay">
          <div className="rider-toast-content">
            <div className="toast-icon">{toast.icon}</div>
            <h3>{toast.title}</h3>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
