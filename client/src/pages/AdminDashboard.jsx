import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

// Import Leaflet dependencies
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Base API connection
const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };
  const [activeTab, setActiveTab] = useState("home"); // "home" represents the visual diagram flowchart
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Loaded DB data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalRiders: 0,
    totalOrders: 0,
    gmv: 0,
    platformCommission: 0,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [riders, setRiders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);

  // System Configs (Surge & Pricing Engine)
  const [surge, setSurge] = useState(1.0);
  const [baseFee, setBaseFee] = useState(30);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [maxRadius, setMaxRadius] = useState(5.0);
  const [maxLoad, setMaxLoad] = useState(2);

  // Marketing Tools inputs
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");

  // Diagnostics Ticker State (Tech & Infra)
  const [cpuUsage, setCpuUsage] = useState(28);
  const [ramUsage, setRamUsage] = useState(62);
  const [queryLatency, setQueryLatency] = useState(4);
  const [socketConnections, setSocketConnections] = useState(12);

  // Simulated live map coordinates for moving riders
  const [mapRiders, setMapRiders] = useState([
    { id: "R-101", name: "Ramesh Kumar", lat: 28.6149, lng: 77.2099, status: "on_delivery", heading: 45 },
    { id: "R-102", name: "Sunil Verma", lat: 28.6210, lng: 77.1950, status: "online", heading: 120 },
    { id: "R-103", name: "Deepak Singh", lat: 28.6015, lng: 77.2210, status: "on_delivery", heading: 270 },
  ]);

  // Simulated orders with geolocation
  const [liveOrders, setLiveOrders] = useState([
    {
      id: "#ORD-9901",
      customer: "Amit Sharma",
      restaurantName: "KFC Connaught Place",
      amount: 450,
      status: "picked_up",
      restCoords: [28.6295, 77.2195],
      custCoords: [28.6120, 77.2010],
      riderCoords: [28.6180, 77.2080],
    },
    {
      id: "#ORD-9902",
      customer: "Priya Roy",
      restaurantName: "Domino's Pizza Sector 18",
      amount: 620,
      status: "preparing",
      restCoords: [28.5700, 77.3200],
      custCoords: [28.5820, 77.3350],
      riderCoords: [28.5720, 77.3220],
    }
  ]);

  // Simulated compliance audits
  const [complianceLogs, setComplianceLogs] = useState([
    { id: 1, name: "KFC Connaught Place", fssai: "10020051000124", status: "verified", auditDate: "2026-05-10" },
    { id: 2, name: "Pizza Hut Noida", fssai: "22218074000392", status: "verified", auditDate: "2026-05-15" },
    { id: 3, name: "The Burger Club", fssai: "34920042000109", status: "pending", auditDate: "Pending Upload" },
  ]);

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // Auto movement simulation
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const simulationInterval = useRef(null);

  // Fetch admin credentials & headers
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowNotificationToast(true);
    setTimeout(() => {
      setShowNotificationToast(false);
    }, 3500);
  };

  // Main data loader
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const resStats = await axios.get(`${API_URL}/admin/stats`, getHeaders());
      if (resStats.data) {
        setStats(resStats.data.metrics);
        setSurge(resStats.data.metrics.surgeMultiplier || 1.0);
        setBaseFee(resStats.data.metrics.baseDeliveryFee || 30);
      }

      const resRestaurants = await axios.get(`${API_URL}/admin/restaurants`, getHeaders());
      setRestaurants(resRestaurants.data);

      const resRiders = await axios.get(`${API_URL}/admin/riders`, getHeaders());
      setRiders(resRiders.data);

      const resUsers = await axios.get(`${API_URL}/admin/users`, getHeaders());
      setUsers(resUsers.data);

      const resOrders = await axios.get(`${API_URL}/admin/orders`, getHeaders());
      setOrders(resOrders.data);

      const resTickets = await axios.get(`${API_URL}/admin/tickets`, getHeaders());
      setTickets(resTickets.data);

      setLoading(false);
    } catch (error) {
      console.error("Error loading admin data from backend:", error);
      // Backend handles fallback mock data gracefully if DB collections are empty
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Set up diagnostic tickers (Tech & Infra Tab)
    const tickInterval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        const next = prev + delta;
        return next > 90 ? 80 : next < 10 ? 15 : next;
      });
      setRamUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 95 ? 90 : next < 40 ? 50 : next;
      });
      setQueryLatency((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return next > 15 ? 10 : next < 2 ? 3 : next;
      });
    }, 3000);

    return () => {
      clearInterval(tickInterval);
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, []);

  // Simulating movement of online riders on the map
  const toggleSimulation = () => {
    if (isSimulatingMovement) {
      clearInterval(simulationInterval.current);
      setIsSimulatingMovement(false);
      showToast("Real-time rider coordinate simulation paused.");
    } else {
      setIsSimulatingMovement(true);
      showToast("Live operational delivery simulation initialized!");
      simulationInterval.current = setInterval(() => {
        // Move live order riders closer to their customers
        setLiveOrders((prevOrders) =>
          prevOrders.map((order) => {
            const [rx, ry] = order.riderCoords;
            const [cx, cy] = order.custCoords;

            // Shift coordinate 5% closer to customer
            const newRx = rx + (cx - rx) * 0.05;
            const newRy = ry + (cy - ry) * 0.05;

            // Check if arrived
            const dist = Math.sqrt(Math.pow(cx - newRx, 2) + Math.pow(cy - newRy, 2));
            if (dist < 0.001) {
              return {
                ...order,
                riderCoords: [order.restCoords[0] + (Math.random() - 0.5) * 0.02, order.restCoords[1] + (Math.random() - 0.5) * 0.02],
                status: "preparing",
              };
            }

            return {
              ...order,
              riderCoords: [newRx, newRy],
              status: order.status === "preparing" ? "picked_up" : order.status,
            };
          })
        );
      }, 1500);
    }
  };

  // Approve restaurant
  const handleApproveRestaurant = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/restaurants/${id}/status`, { status }, getHeaders());
      showToast(`Restaurant status successfully updated to "${status}"!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update restaurant status.");
    }
  };

  // Toggle user ban
  const handleToggleUserBan = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${id}/ban`, {}, getHeaders());
      const stateStr = res.data.user.isBanned ? "Banned" : "Unbanned";
      showToast(`Account successfully ${stateStr}!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle user restriction.");
    }
  };

  // Suspend Rider profile
  const handleToggleRiderStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "offline" ? "online" : "offline";
    try {
      await axios.put(`${API_URL}/admin/riders/${id}/status`, { status: nextStatus }, getHeaders());
      showToast(`Rider state changed to ${nextStatus}!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to adjust rider profile.");
    }
  };

  // Dispatch / Assign rider
  const handleAssignRider = async (orderId, riderId) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/dispatch`, { riderId, status: "preparing" }, getHeaders());
      showToast("Rider dispatched successfully!");
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to assign rider to delivery route.");
    }
  };

  // Save Surge Slider
  const handleSavePricing = async () => {
    try {
      await axios.put(
        `${API_URL}/admin/pricing`,
        {
          surge,
          deliveryFee: baseFee,
          autoDispatch,
          maxRadius,
          maxLoad,
        },
        getHeaders()
      );
      showToast("Operational pricing parameters successfully updated platform-wide!");
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to save pricing configuration.");
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId, status) => {
    try {
      await axios.put(`${API_URL}/admin/tickets/${ticketId}/resolve`, { status }, getHeaders());
      showToast(`Support Ticket ${ticketId} marked as ${status}!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast("Failed to resolve ticket.");
    }
  };

  // Trigger push campaign simulation
  const handleBlastPushCampaign = (e) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) {
      showToast("Please supply both push campaign header and message body.");
      return;
    }
    showToast(`Push Notification Sent to ${users.length || 854} active customer apps! 📣`);
    setPushTitle("");
    setPushBody("");
  };

  // Perform mock FSSAI audits
  const handleVerifyFssai = (id, newStatus) => {
    setComplianceLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: newStatus, auditDate: new Date().toISOString().split("T")[0] } : log))
    );
    showToast("Restaurant health and FSSAI registry status updated.");
  };

  return (
    <div className="admin-container">
      {/* Toast Alert Notification */}
      {showNotificationToast && (
        <div className="popup-overlay" style={{ zIndex: 99999, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowNotificationToast(false)}>
          <div className="popup-content" style={{ borderLeft: "4px solid #ff4d00" }}>
            <div className="popup-icon" style={{ background: "rgba(255,77,0,0.1)", color: "#ff4d00", border: "1px solid rgba(255,77,0,0.3)" }}>✓</div>
            <h3>Operations Panel Notification</h3>
            <p style={{ color: "#cbd5e1", marginTop: "8px" }}>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-small">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <circle cx="22" cy="22" r="22" fill="#FF4D00" />
              <path d="M22 10 L23.5 18 L31.5 19.5 L23.5 21 L22 29 L20.5 21 L12.5 19.5 L20.5 18 Z" fill="white" />
            </svg>
          </div>
          <span className="brand-text">system.instameal</span>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => { setActiveTab("home"); loadAdminData(); }} className={`sidebar-link ${activeTab === "home" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            System Hub Map
          </button>
          <button onClick={() => setActiveTab("command")} className={`sidebar-link ${activeTab === "command" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            Live Command Center
          </button>
          <button onClick={() => setActiveTab("restaurants")} className={`sidebar-link ${activeTab === "restaurants" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Restaurants
          </button>
          <button onClick={() => setActiveTab("riders")} className={`sidebar-link ${activeTab === "riders" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Riders
          </button>
          <button onClick={() => setActiveTab("users")} className={`sidebar-link ${activeTab === "users" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Customers
          </button>
          <button onClick={() => setActiveTab("pricing")} className={`sidebar-link ${activeTab === "pricing" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Pricing Engine
          </button>
          <button onClick={() => setActiveTab("tech")} className={`sidebar-link ${activeTab === "tech" ? "active" : ""}`} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Infra Diagnostics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button 
            onClick={handleLogout} 
            className="sidebar-link" 
            style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search-container">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search system routes, tokens, nodes..." className="admin-search-input" />
          </div>
          <div className="admin-profile-section">
            <div className="notification-bell">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="notification-dot"></span>
            </div>
            <div className="profile-info">
              <div className="profile-avatar">{user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'OP'}</div>
              <div className="profile-text">
                <span className="profile-name">{user?.name || 'Systems Root'}</span>
                <span className="profile-email">{user?.email || 'admin@instameal.com'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic scroll area */}
        <div className="admin-content-scroll">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
              <div className="brand-logo-small" style={{ width: "48px", height: "48px", animation: "spin 2s linear infinite" }}>
                <svg viewBox="0 0 44 44" fill="none" width="32" height="32">
                  <circle cx="22" cy="22" r="22" fill="#FF4D00" />
                </svg>
              </div>
              <p style={{ marginTop: "16px", fontFamily: "Fira Code", fontSize: "0.9rem" }}>FETCHING NETWORK TOPOLOGY STATE...</p>
            </div>
          ) : activeTab === "home" ? (
            /* ========================================================================= */
            /* ==================== visual flowchart diagram welcome page ============== */
            /* ========================================================================= */
            <div className="admin-operations-flowchart">
              <div>
                <h1 className="flowchart-section-title">Admin & Operations Panel</h1>
                <p className="flowchart-section-subtitle">
                  This is the most powerful layer — completely invisible to customers and restaurants, run by instaMeal's internal systems team.
                </p>
              </div>

              {/* 1. Real-time command center */}
              <div className="flowchart-node-full" onClick={() => setActiveTab("command")}>
                <div className="flow-node-card node-gray">
                  <div className="flow-node-title">Real-time command center</div>
                  <div className="flow-node-desc">Live map of all active orders • riders • restaurants across every city</div>
                </div>
              </div>

              <div className="flowchart-arrow">↓</div>

              {/* 2. Operations Row */}
              <div className="flowchart-node-row">
                <div className="flow-node-card node-violet" onClick={() => setActiveTab("restaurants")}>
                  <div className="flow-node-title">Restaurant mgmt</div>
                  <div className="flow-node-desc">Approve • delist • audit</div>
                </div>
                <div className="flow-node-card node-violet" onClick={() => setActiveTab("riders")}>
                  <div className="flow-node-title">Rider management</div>
                  <div className="flow-node-desc">Onboard • suspend • score</div>
                </div>
                <div className="flow-node-card node-violet" onClick={() => setActiveTab("users")}>
                  <div className="flow-node-title">Customer accounts</div>
                  <div className="flow-node-desc">Refunds • bans • KYC</div>
                </div>
              </div>

              <div className="flowchart-arrow">↓</div>

              {/* 3. Algorithms Row */}
              <div className="flowchart-node-row">
                <div className="flow-node-card node-emerald" onClick={() => setActiveTab("fraud")}>
                  <div className="flow-node-title">Fraud detection</div>
                  <div className="flow-node-desc">Fake orders • COD abuse</div>
                </div>
                <div className="flow-node-card node-emerald" onClick={() => setActiveTab("dispatch")}>
                  <div className="flow-node-title">Dispatch engine</div>
                  <div className="flow-node-desc">Manual dispatch • auto config</div>
                </div>
                <div className="flow-node-card node-emerald" onClick={() => setActiveTab("pricing")}>
                  <div className="flow-node-title">Pricing engine</div>
                  <div className="flow-node-desc">Surge • delivery fee • offers</div>
                </div>
              </div>

              <div className="flowchart-arrow">↓</div>

              {/* 4. Support Row */}
              <div className="flowchart-node-row">
                <div className="flow-node-card node-amber" onClick={() => setActiveTab("finance")}>
                  <div className="flow-node-title">Finance & payouts</div>
                  <div className="flow-node-desc">Commission • GST • TDS splits</div>
                </div>
                <div className="flow-node-card node-amber" onClick={() => setActiveTab("support")}>
                  <div className="flow-node-title">Customer support</div>
                  <div className="flow-node-desc">Tickets • escalation • refunds</div>
                </div>
                <div className="flow-node-card node-amber" onClick={() => setActiveTab("marketing")}>
                  <div className="flow-node-title">Marketing tools</div>
                  <div className="flow-node-desc">Campaigns • push notifications</div>
                </div>
              </div>

              <div className="flowchart-arrow">↓</div>

              {/* 5. Business / Analytics Row */}
              <div className="flowchart-node-row">
                <div className="flow-node-card node-blue" onClick={() => setActiveTab("analytics")}>
                  <div className="flow-node-title">Business analytics</div>
                  <div className="flow-node-desc">GMV • retention • NPS</div>
                </div>
                <div className="flow-node-card node-blue" onClick={() => setActiveTab("cityops")}>
                  <div className="flow-node-title">City ops team</div>
                  <div className="flow-node-desc">Supply • zone config • growth</div>
                </div>
                <div className="flow-node-card node-blue" onClick={() => setActiveTab("tech")}>
                  <div className="flow-node-title">Tech & infra</div>
                  <div className="flow-node-desc">API • servers • uptime • SLAs</div>
                </div>
              </div>

              <div className="flowchart-arrow">↓</div>

              {/* 6. Compliance Full Card */}
              <div className="flowchart-node-full" onClick={() => setActiveTab("compliance")}>
                <div className="flow-node-card node-gray">
                  <div className="flow-node-title">Compliance & legal</div>
                  <div className="flow-node-desc">FSSAI audits • data privacy • government reporting • insurance</div>
                </div>
              </div>

              <p className="flowchart-footer-explainer">Tap any module to explore operational depth and take administrative action.</p>
            </div>
          ) : (
            /* ========================================================================= */
            /* ==================== SUBPANELS DRAWER AND TABS VIEW ===================== */
            /* ========================================================================= */
            <div className="admin-tab-content-container">
              <div className="panel-header-section">
                <div>
                  <button className="btn-back-flow" onClick={() => setActiveTab("home")}>
                    ← Back to Systems Diagram
                  </button>
                  <h1 className="panel-title" style={{ marginTop: "16px" }}>
                    {activeTab === "command" && "Real-Time Command Center"}
                    {activeTab === "restaurants" && "Restaurant Management"}
                    {activeTab === "riders" && "Rider Control Board"}
                    {activeTab === "users" && "Customer Accounts & Banlist"}
                    {activeTab === "pricing" && "Dynamic Pricing & Surges"}
                    {activeTab === "tech" && "Infrastructure & Node Diagnostics"}
                    {activeTab === "fraud" && "Fraud Alerts & Risk Engine"}
                    {activeTab === "dispatch" && "Manual Dispatch Control"}
                    {activeTab === "finance" && "Finance Ledger & Commission Split"}
                    {activeTab === "support" && "Escalations & Customer Support"}
                    {activeTab === "marketing" && "Promotions & Campaign Control"}
                    {activeTab === "analytics" && "Advanced Business Analytics"}
                    {activeTab === "cityops" && "City Operations & Zone config"}
                    {activeTab === "compliance" && "Compliance Audits & Legal Registry"}
                  </h1>
                  <p className="panel-subtitle">
                    {activeTab === "command" && "Live spatial map and active courier telemetry tracing."}
                    {activeTab === "restaurants" && "Verify merchants, delist stores, audit store holiday modes."}
                    {activeTab === "riders" && "Onboard couriers, verify background check KYC records, check courier standings."}
                    {activeTab === "users" && "Search user registry, suspend access protocols, manage profiles."}
                    {activeTab === "pricing" && "Control surge values, configure baseline delivery tariffs, and manage coupons."}
                    {activeTab === "tech" && "Check socket loads, CPU gauges, database latencies, query optimizations."}
                    {activeTab === "fraud" && "Monitor COD order loops, suspicious multi-account triggers, fake order locks."}
                    {activeTab === "dispatch" && "Manually link active orders to online riders."}
                    {activeTab === "finance" && "Calculate gross payouts, TDS (1%), GST (18%), and platfor commission metrics."}
                    {activeTab === "support" && "Address support claims, check chat reasons, and grant instant refunds."}
                    {activeTab === "marketing" && "Broadcast push messaging campaigns to all client application devices."}
                    {activeTab === "analytics" && "SVG GMV metrics, NPS satisfaction ratings, customer repeat loops."}
                    {activeTab === "cityops" && "Configure operational radius boundaries and zone limits."}
                    {activeTab === "compliance" && "Track restaurant FSSAI license numbers and legal standing."}
                  </p>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* NODE 1: REAL-TIME COMMAND CENTER                             */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "command" && (
                <div className="map-workspace-grid">
                  <div className="admin-card-glass map-card-wrapper" style={{ height: "500px", padding: 0 }}>
                    <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      />

                      {/* Render restaurants in Delhi as green markers */}
                      <CircleMarker center={[28.6295, 77.2195]} radius={9} fillColor="#10b981" color="#059669" fillOpacity={0.8}>
                        <Popup><strong>Restaurant Node: KFC Connaught Place</strong><br/>Active status: Open</Popup>
                      </CircleMarker>
                      <CircleMarker center={[28.5700, 77.3200]} radius={9} fillColor="#10b981" color="#059669" fillOpacity={0.8}>
                        <Popup><strong>Restaurant Node: Domino's Pizza</strong><br/>Active status: Open</Popup>
                      </CircleMarker>

                      {/* Render online riders as blue markers */}
                      {mapRiders.map((rider) => (
                        <CircleMarker key={rider.id} center={[rider.lat, rider.lng]} radius={8} fillColor="#3b82f6" color="#2563eb" fillOpacity={0.8}>
                          <Popup><strong>Rider: {rider.name}</strong><br/>Status: {rider.status}</Popup>
                        </CircleMarker>
                      ))}

                      {/* Render live orders tracking with routing lines */}
                      {liveOrders.map((order) => (
                        <div key={order.id}>
                          {/* Dotted polyline Restaurant -> Rider -> Customer */}
                          <Polyline positions={[order.restCoords, order.riderCoords]} color="#ff4d00" dashArray="5, 10" weight={2} />
                          <Polyline positions={[order.riderCoords, order.custCoords]} color="#a855f7" dashArray="5, 10" weight={2} />

                          {/* Customer Location */}
                          <CircleMarker center={order.custCoords} radius={7} fillColor="#f59e0b" color="#d97706" fillOpacity={0.9}>
                            <Popup><strong>Customer: {order.customer}</strong><br/>Order: {order.id}</Popup>
                          </CircleMarker>

                          {/* Rider Node in delivery */}
                          <CircleMarker center={order.riderCoords} radius={8} fillColor="#ff4d00" color="#c2410c" fillOpacity={1}>
                            <Popup><strong>Rider Tracking: {order.id}</strong><br/>Current Status: {order.status}</Popup>
                          </CircleMarker>
                        </div>
                      ))}
                    </MapContainer>

                    <div className="map-control-overlay">
                      <div className="map-legend-item">
                        <span className="legend-dot" style={{ background: "#10b981" }}></span>
                        <span>Restaurants</span>
                      </div>
                      <div className="map-legend-item">
                        <span className="legend-dot" style={{ background: "#3b82f6" }}></span>
                        <span>Online Riders</span>
                      </div>
                      <div className="map-legend-item">
                        <span className="legend-dot" style={{ background: "#ff4d00" }}></span>
                        <span>Active Orders</span>
                      </div>
                      <button className="btn-action-small" onClick={toggleSimulation} style={{ background: "#ff4d00", color: "white", border: "none" }}>
                        {isSimulatingMovement ? "Pause Telemetry" : "Simulate Deliveries"}
                      </button>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Live Dispatch Feed</h2>
                    <div className="map-active-feed">
                      {liveOrders.map((o) => (
                        <div className="feed-item" key={o.id}>
                          <div className="feed-item-title">
                            <span>{o.id}</span>
                            <span className="feed-time">{o.status}</span>
                          </div>
                          <div className="feed-item-desc">
                            From: <strong>{o.restaurantName}</strong><br/>
                            To: <strong>{o.customer}</strong><br/>
                            Total Ticket: ₹{o.amount}
                          </div>
                        </div>
                      ))}
                      <div className="feed-item" style={{ borderLeft: "3px solid #10b981" }}>
                        <div className="feed-item-title">
                          <span>SYSTEM LOG</span>
                          <span style={{ color: "#10b981" }}>HEALTHY</span>
                        </div>
                        <div className="feed-item-desc">
                          All regional nodes operating normally. Regional surge set to {surge}x.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 2: RESTAURANT MGMT                                       */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "restaurants" && (
                <div className="admin-card-glass">
                  <div className="admin-search-actions-bar">
                    <h2>Registered Merchants ({restaurants.length || 4})</h2>
                    <button className="btn-back-flow" onClick={() => loadAdminData()} style={{ background: "#ff4d00", color: "white" }}>Refresh Merchants</button>
                  </div>
                  <div className="glass-table-wrapper">
                    <table className="admin-glass-table">
                      <thead>
                        <tr>
                          <th>Merchant Name</th>
                          <th>Owner</th>
                          <th>Rating</th>
                          <th>Avg Prep Time</th>
                          <th>Status</th>
                          <th>Holiday Mode</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(restaurants.length > 0 ? restaurants : [
                          { _id: "RST-001", name: "KFC Connaught Place", owner: { name: "Rahul Sharma", email: "rahul@kfc.com" }, rating: 4.5, prepTime: 20, status: "approved", holidayMode: false },
                          { _id: "RST-002", name: "Pizza Hut Noida", owner: { name: "Sunita Kapoor", email: "sunita@pizzahut.com" }, rating: 4.2, prepTime: 25, status: "approved", holidayMode: false },
                          { _id: "RST-003", name: "The Burger Club", owner: { name: "Gaurav Malhotra", email: "gaurav@burgerclub.com" }, rating: 3.9, prepTime: 15, status: "pending", holidayMode: false },
                          { _id: "RST-004", name: "Chaat Rasoi", owner: { name: "Manoj Prasad", email: "manoj@chaat.com" }, rating: 4.0, prepTime: 10, status: "rejected", holidayMode: true }
                        ]).map((rest) => (
                          <tr key={rest._id}>
                            <td style={{ fontWeight: 600, color: "#f8fafc" }}>{rest.name}</td>
                            <td>
                              <div>{rest.owner?.name || "Not Assigned"}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{rest.owner?.email || ""}</div>
                            </td>
                            <td>⭐ {rest.rating}</td>
                            <td>{rest.prepTime} min</td>
                            <td>
                              <span className={`badge-status badge-${rest.status}`}>
                                {rest.status}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: rest.holidayMode ? "#ef4444" : "#10b981" }}>
                                {rest.holidayMode ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {rest.status !== "approved" && (
                                  <button className="btn-action-small btn-action-approve" onClick={() => handleApproveRestaurant(rest._id, "approved")}>
                                    Approve
                                  </button>
                                )}
                                {rest.status === "approved" && (
                                  <button className="btn-action-small btn-action-ban" onClick={() => handleApproveRestaurant(rest._id, "rejected")}>
                                    Delist
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 3: RIDER CONTROL BOARD                                  */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "riders" && (
                <div className="admin-card-glass">
                  <div className="admin-search-actions-bar">
                    <h2>Registered Delivery Fleet ({riders.length || 3})</h2>
                    <button className="btn-back-flow" onClick={() => loadAdminData()} style={{ background: "#ff4d00", color: "white" }}>Refresh Couriers</button>
                  </div>
                  <div className="glass-table-wrapper">
                    <table className="admin-glass-table">
                      <thead>
                        <tr>
                          <th>Courier Name</th>
                          <th>Duty Status</th>
                          <th>Zone</th>
                          <th>Fleet Score</th>
                          <th>Earnings (Gross)</th>
                          <th>KYC Verification Documents</th>
                          <th>Action Panel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(riders.length > 0 ? riders : [
                          { _id: "RID-101", user: { name: "Ramesh Kumar", email: "ramesh@delivery.com" }, status: "on_delivery", zone: "New Delhi Central", earnings: 4500, aadharNumber: "3492-0941-8932", licenseNumber: "DL-14902049302" },
                          { _id: "RID-102", user: { name: "Sunil Verma", email: "sunil@delivery.com" }, status: "online", zone: "Noida East", earnings: 3800, aadharNumber: "5940-2094-0982", licenseNumber: "UP-16209402940" },
                          { _id: "RID-103", user: { name: "Deepak Singh", email: "deepak@delivery.com" }, status: "offline", zone: "Gurgaon Sector 21", earnings: 1200, aadharNumber: "8930-2940-1092", licenseNumber: "HR-26204902941" }
                        ]).map((rider) => (
                          <tr key={rider._id}>
                            <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                              <div>{rider.user?.name || "Rider Profile"}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{rider.user?.email || ""}</div>
                            </td>
                            <td>
                              <span className={`badge-status badge-${rider.status === "on_delivery" ? "delivery" : rider.status}`}>
                                {rider.status}
                              </span>
                            </td>
                            <td>{rider.zone || "Not Assigned"}</td>
                            <td>⭐⭐⭐⭐☆ (4.3)</td>
                            <td>₹{rider.earnings}</td>
                            <td>
                              <div style={{ fontSize: "0.8rem" }}>
                                🪪 Aadhar: {rider.aadharNumber ? "✅ Verified" : "❌ Pending"}<br/>
                                🪪 License: {rider.licenseNumber ? "✅ Verified" : "❌ Pending"}
                              </div>
                            </td>
                            <td>
                              <button className={`btn-action-small ${rider.status === "offline" ? "btn-action-approve" : "btn-action-ban"}`} onClick={() => handleToggleRiderStatus(rider._id, rider.status)}>
                                {rider.status === "offline" ? "Put Online" : "Suspend Courier"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 4: CUSTOMER ACCOUNTS                                     */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "users" && (
                <div className="admin-card-glass">
                  <div className="admin-search-actions-bar">
                    <h2>Platform Customers ({users.filter(u => u.role === "customer").length || 3})</h2>
                    <button className="btn-back-flow" onClick={() => loadAdminData()} style={{ background: "#ff4d00", color: "white" }}>Refresh Directory</button>
                  </div>
                  <div className="glass-table-wrapper">
                    <table className="admin-glass-table">
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>Email Address</th>
                          <th>Phone Line</th>
                          <th>Access Role</th>
                          <th>Operational Standing</th>
                          <th>Management actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(users.length > 0 ? users : [
                          { _id: "USR-001", name: "Ananya Sen", email: "ananya@gmail.com", phone: "+91 9999011244", role: "customer", isBanned: false },
                          { _id: "USR-002", name: "Rohan Kumar", email: "rohan@gmail.com", phone: "+91 9888492091", role: "customer", isBanned: false },
                          { _id: "USR-003", name: "Vikram Singh", email: "vikram@gmail.com", phone: "+91 8765432109", role: "customer", isBanned: true },
                        ]).map((u) => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 600, color: "#f8fafc" }}>{u.name}</td>
                            <td>{u.email || "No Email linked"}</td>
                            <td>{u.phone || "No Phone linked"}</td>
                            <td><span className="badge-status" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc" }}>{u.role}</span></td>
                            <td>
                              <span className={`badge-status ${u.isBanned ? "badge-status badge-rejected" : "badge-status badge-approved"}`}>
                                {u.isBanned ? "BANNED" : "HEALTHY"}
                              </span>
                            </td>
                            <td>
                              <button className={`btn-action-small ${u.isBanned ? "btn-action-approve" : "btn-action-ban"}`} onClick={() => handleToggleUserBan(u._id)}>
                                {u.isBanned ? "Lift Ban" : "Restrict Account"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 5: FRAUD & THREAT DETECTION                            */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "fraud" && (
                <div className="fraud-alerts-grid">
                  <div className="admin-card-glass">
                    <h2>Active Risk Alerts</h2>
                    <div className="threat-alerts-list" style={{ marginTop: "20px" }}>
                      <div className="threat-alert-card">
                        <div>
                          <strong style={{ color: "#ef4444" }}>[COD Abuse Loop Detected]</strong>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                            Customer <strong>Vikram Singh</strong> (vikram@gmail.com) cancelled 3 successive cash-on-delivery orders inside 20 minutes.
                          </p>
                        </div>
                        <button className="btn-action-small btn-action-ban" onClick={() => showToast("Account restricted due to COD abuse.")}>Banish user</button>
                      </div>

                      <div className="threat-alert-card" style={{ borderLeftColor: "#f59e0b" }}>
                        <div>
                          <strong style={{ color: "#f59e0b" }}>[Fake Restaurant Spikes]</strong>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                            Restaurant <strong>Chaat Rasoi</strong> is showing immediate fake delivery confirmations under 2 minutes. High chargeback risk.
                          </p>
                        </div>
                        <button className="btn-action-small" onClick={() => showToast("Auditors flagged Chaat Rasoi for verification.")}>Audit Store</button>
                      </div>

                      <div className="threat-alert-card" style={{ borderLeftColor: "#3b82f6" }}>
                        <div>
                          <strong style={{ color: "#3b82f6" }}>[GPS Spoof Alert]</strong>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                            Rider <strong>Sunil Verma</strong> coordinate shifts indicate artificial simulator telemetry usage.
                          </p>
                        </div>
                        <button className="btn-action-small" onClick={() => showToast("Rider coordinates reset requested.")}>Lock Courier</button>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Operational Standards</h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.6", marginTop: "12px" }}>
                      Our automated risk engines verify spatial telemetry every 10 seconds. Customers repeating fake refund scripts are automatically flagged here.
                    </p>
                    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button className="btn-action-small" onClick={() => showToast("Global risk profiles cleared.")}>Flush System Threat Logs</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 6: DISPATCH ENGINE CONTROL                              */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "dispatch" && (
                <div className="dispatch-console-wrapper">
                  <div className="admin-card-glass">
                    <h2>Manual Order Allocations ({orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length || 2})</h2>
                    <div className="dispatch-orders-queue" style={{ marginTop: "20px" }}>
                      {(orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length > 0 ? orders.filter(o => o.status !== "delivered" && o.status !== "cancelled") : [
                        { _id: "ORD-2043", user: { name: "Rohan Kumar" }, restaurant: { name: "KFC Connaught Place" }, totalPrice: 450, status: "preparing", rider: null },
                        { _id: "ORD-2044", user: { name: "Ananya Sen" }, restaurant: { name: "Pizza Hut Noida" }, totalPrice: 620, status: "confirmed", rider: null },
                      ]).map((order) => (
                        <div className="dispatch-queue-card" key={order._id}>
                          <div className="dispatch-queue-header">
                            <div>
                              <strong style={{ color: "#ff4d00" }}>{order._id}</strong>
                              <span style={{ marginLeft: "12px", color: "#64748b" }}>Status: {order.status}</span>
                            </div>
                            <strong style={{ color: "#cbd5e1" }}>₹{order.totalPrice}</strong>
                          </div>
                          <div className="dispatch-route-visual">
                            📍 <strong>{order.restaurant?.name || "Merchant"}</strong> ➔ 📦 <strong>{order.user?.name || "Customer"}</strong>
                          </div>
                          <div className="dispatch-rider-picker">
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Assign Courier:</span>
                            <select className="dispatch-select" onChange={(e) => handleAssignRider(order._id, e.target.value)} defaultValue="">
                              <option value="" disabled>-- Choose Available Courier --</option>
                              {riders.length > 0 ? (
                                riders.map(r => <option key={r._id} value={r._id}>{r.user?.name || "Courier"} ({r.zone || "No Zone"})</option>)
                              ) : (
                                <>
                                  <option value="RID-101">Ramesh Kumar (Delhi Central)</option>
                                  <option value="RID-102">Sunil Verma (Noida East)</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Dispatch Engine Rules</h2>
                    <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input type="checkbox" checked={autoDispatch} onChange={(e) => { setAutoDispatch(e.target.checked); showToast(`Auto-Dispatch rules set to ${e.target.checked ? "ENABLED" : "DISABLED"}`); }} />
                        <span>Enable Auto-Dispatch Algorithm</span>
                      </label>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Search Allocation Radius ({maxRadius} km):</label>
                        <input type="range" className="custom-ops-slider" min="1" max="15" step="0.5" value={maxRadius} onChange={(e) => setMaxRadius(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Max Delivery Load Per Rider ({maxLoad}):</label>
                        <input type="range" className="custom-ops-slider" min="1" max="5" value={maxLoad} onChange={(e) => setMaxLoad(parseInt(e.target.value))} />
                      </div>
                      <button className="btn-action-small" onClick={handleSavePricing} style={{ background: "#ff4d00", color: "white" }}>Save Dispatch Parameters</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 7: PRICING ENGINE                                        */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "pricing" && (
                <div className="pricing-config-grid">
                  <div className="admin-card-glass">
                    <h2>Region Surge & Base Tariffs</h2>

                    <div className="pricing-slider-block">
                      <div className="slider-values-display">
                        <label>Active Surge Multiplier</label>
                        <span className="slider-big-val">{surge.toFixed(1)}x</span>
                      </div>
                      <input type="range" className="custom-ops-slider" min="1.0" max="3.0" step="0.1" value={surge} onChange={(e) => setSurge(parseFloat(e.target.value))} />
                      <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Increases baseline order checkout totals in rainy/peak hours.</p>
                    </div>

                    <div className="pricing-slider-block" style={{ marginTop: "24px" }}>
                      <div className="slider-values-display">
                        <label>Base Delivery Fee</label>
                        <span className="slider-big-val">₹{baseFee}</span>
                      </div>
                      <input type="range" className="custom-ops-slider" min="15" max="100" step="5" value={baseFee} onChange={(e) => setBaseFee(parseInt(e.target.value))} />
                      <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Baseline tariff paid to riders per delivery loop.</p>
                    </div>

                    <button className="btn-back-flow" onClick={handleSavePricing} style={{ marginTop: "24px", background: "#ff4d00", color: "white", width: "100%", justifyContent: "center" }}>
                      Deploy Pricing Configuration
                    </button>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Active Coupon Campaigns</h2>
                    <div className="pricing-offers-list">
                      <div className="offer-coupon-badge">
                        <div>
                          <strong>INSTAMEAL50</strong><br/>
                          <span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>₹50 off on orders above ₹199</span>
                        </div>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>ACTIVE</span>
                      </div>
                      <div className="offer-coupon-badge" style={{ borderColor: "rgba(168,85,247,0.3)" }}>
                        <div>
                          <strong>FREEFLOW</strong><br/>
                          <span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>Free delivery on selected premium merchants</span>
                        </div>
                        <span style={{ color: "#c084fc", fontWeight: 700 }}>ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 8: FINANCE & PAYOUTS                                     */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "finance" && (
                <div className="admin-tab-content-container">
                  <div className="quick-metrics-row">
                    <div className="ops-metric-card">
                      <span className="ops-metric-label">Platform GMV</span>
                      <span className="ops-metric-value">₹{stats.gmv || "2,45,890"}</span>
                    </div>
                    <div className="ops-metric-card">
                      <span className="ops-metric-label">Commission (15%)</span>
                      <span className="ops-metric-value">₹{stats.platformCommission || "36,883"}</span>
                    </div>
                    <div className="ops-metric-card">
                      <span className="ops-metric-label">Auto TDS Split (1%)</span>
                      <span className="ops-metric-value">₹{(stats.gmv * 0.01) || "2,458"}</span>
                    </div>
                    <div className="ops-metric-card">
                      <span className="ops-metric-label">Rider Payout Pool</span>
                      <span className="ops-metric-value">₹{riders.reduce((s, r) => s + (r.earnings || 0), 0) || "9,500"}</span>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Settlements Ledger</h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
                      Direct operational dashboard calculating GST compliance fees, merchant payouts, and net bank settlements.
                    </p>
                    <div className="glass-table-wrapper">
                      <table className="admin-glass-table">
                        <thead>
                          <tr>
                            <th>Recipient</th>
                            <th>Role</th>
                            <th>Total Gross Vol</th>
                            <th>Platform Cut</th>
                            <th>Tax Reserved (GST/TDS)</th>
                            <th>Net Bank Settlement</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: 600 }}>KFC Connaught Place</td>
                            <td>Merchant</td>
                            <td>₹45,890</td>
                            <td>₹6,883 (15%)</td>
                            <td>₹2,294 (5%)</td>
                            <td style={{ color: "#10b981", fontWeight: 700 }}>₹36,713</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 600 }}>Ramesh Kumar</td>
                            <td>Courier</td>
                            <td>₹4,500</td>
                            <td>₹0 (0%)</td>
                            <td>₹45 (1% TDS)</td>
                            <td style={{ color: "#10b981", fontWeight: 700 }}>₹4,455</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 9: CUSTOMER SUPPORT & TICKET ESCALATIONS                */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "support" && (
                <div className="support-tickets-board">
                  <div className="admin-card-glass" style={{ gridColumn: "1 / -1" }}>
                    <h2>Customer Support Desk</h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
                      Live support requests escalated from customer and rider applications.
                    </p>
                  </div>

                  {(tickets.length > 0 ? tickets : supportTickets).map((ticket) => (
                    <div className={`ticket-card ticket-priority-${ticket.priority}`} key={ticket._id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{ticket._id}</span>
                          <h3 style={{ fontSize: "1.1rem", color: "#f8fafc", margin: "4px 0" }}>{ticket.subject}</h3>
                        </div>
                        <span className="badge-status" style={{ background: ticket.status === "open" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: ticket.status === "open" ? "#f59e0b" : "#10b981" }}>
                          {ticket.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                        <strong>Customer:</strong> {ticket.customer?.name} ({ticket.customer?.email})<br/>
                        <strong>Link Order:</strong> {ticket.orderId}
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "#94a3b8", background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: "6px" }}>
                        {ticket.description}
                      </p>
                      {ticket.status === "open" && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className="btn-action-small btn-action-approve" onClick={() => handleResolveTicket(ticket._id, "resolved")}>
                            Close & Settle Refund
                          </button>
                          <button className="btn-action-small" onClick={() => handleResolveTicket(ticket._id, "resolved")}>
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 10: MARKETING CAMPAIGNS                                  */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "marketing" && (
                <div className="pricing-config-grid">
                  <div className="admin-card-glass">
                    <h2>Broadcast Push Notification</h2>
                    <form onSubmit={handleBlastPushCampaign} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Campaign Banner Header</label>
                        <input type="text" className="dispatch-select" style={{ width: "100%", marginTop: "6px" }} placeholder="e.g. 50% Off Lunch Hour Surge Alert!" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Broadcast Body Text</label>
                        <textarea className="dispatch-select" style={{ width: "100%", height: "100px", marginTop: "6px", resize: "none" }} placeholder="e.g. Order right now to claim free delivery at Connaught Place..." value={pushBody} onChange={(e) => setPushBody(e.target.value)} />
                      </div>
                      <button className="btn-back-flow" type="submit" style={{ background: "#ff4d00", color: "white", width: "100%", justifyContent: "center" }}>
                        Blast Alert Notification 📣
                      </button>
                    </form>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Active Target Demographics</h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.6", marginTop: "12px" }}>
                      Coupons and notification channels target all customer models. Broadcasting sends real-time payload socket notifications to all active instances.
                    </p>
                    <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                      <strong>Active Target Audience Pool:</strong> {users.length || 854} users
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 11: BUSINESS ANALYTICS                                   */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "analytics" && (
                <div className="pricing-config-grid">
                  <div className="admin-card-glass">
                    <h2>Gross Merchandise Value (GMV) Trend</h2>
                    <div className="analytics-chart-placeholder" style={{ marginTop: "16px" }}>
                      {/* Interactive SVG graph */}
                      <svg className="chart-svg-container" viewBox="0 0 400 200">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 30,170 Q 100,100 180,120 T 350,40" fill="none" stroke="#ff4d00" strokeWidth="3" />
                        <path d="M 30,170 Q 100,100 180,120 T 350,40 L 350,180 L 30,180 Z" fill="url(#chartGlow)" />
                        <circle cx="350" cy="40" r="5" fill="#ff4d00" />
                        <text x="310" y="30" fill="#fff" fontSize="10">₹2.45L</text>
                      </svg>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>NPS & Operations Metrics</h2>
                    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <strong>Net Promoter Score (NPS):</strong>
                        <div style={{ fontSize: "1.8rem", color: "#10b981", fontWeight: 800 }}>82</div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>High customer satisfaction and low cancellations.</span>
                      </div>
                      <div>
                        <strong>Repeat User Retention Rate:</strong>
                        <div style={{ fontSize: "1.8rem", color: "#a855f7", fontWeight: 800 }}>74.2%</div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Weekly orders loop from existing cohorts.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 12: CITY OPERATIONS                                      */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "cityops" && (
                <div className="pricing-config-grid">
                  <div className="admin-card-glass">
                    <h2>Operational Zones</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
                        <strong>New Delhi Central</strong>
                        <span style={{ color: "#10b981" }}>98 restaurants • 32 riders</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
                        <strong>Noida Sector 18</strong>
                        <span style={{ color: "#10b981" }}>45 restaurants • 14 riders</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
                        <strong>Gurgaon DLF Phase 3</strong>
                        <span style={{ color: "#10b981" }}>67 restaurants • 20 riders</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Density Controls</h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "12px" }}>
                      Regulate regional supply ratios. Automatic warnings are raised if active orders exceed total online rider models in that zone.
                    </p>
                    <button className="btn-back-flow" onClick={() => showToast("All regional zones successfully re-balanced.")} style={{ width: "100%", justifyContent: "center", marginTop: "24px", background: "#ff4d00", color: "white" }}>
                      Re-allocate Zone Capacities
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 13: INFRASTRUCTURE DIAGNOSTICS                          */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "tech" && (
                <div className="admin-tab-content-container">
                  <div className="diagnostics-grid">
                    <div className="diag-card">
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>DATABASE QUERY LATENCY</div>
                      <div className="diag-metric-big">{queryLatency}ms</div>
                      <span style={{ color: "#10b981", fontSize: "0.75rem" }}>OPTIMAL INDEXES ✅</span>
                    </div>
                    <div className="diag-card">
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>CORE SERVER CPU LOADS</div>
                      <div className="diag-metric-big" style={{ color: cpuUsage > 75 ? "#ef4444" : "#ff4d00" }}>{cpuUsage}%</div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>NodeJS clusters</span>
                    </div>
                    <div className="diag-card">
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>RAM MEMORY RESERVE</div>
                      <div className="diag-metric-big">{ramUsage}%</div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>16GB Cloud Cluster</span>
                    </div>
                    <div className="diag-card">
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>SOCKET.IO CONNS</div>
                      <div className="diag-metric-big" style={{ color: "#a855f7" }}>{socketConnections}</div>
                      <span style={{ color: "#10b981", fontSize: "0.75rem" }}>Online telemetry clients</span>
                    </div>
                  </div>

                  <div className="admin-card-glass">
                    <h2>Tech Stack Health Ledger</h2>
                    <div className="glass-table-wrapper">
                      <table className="admin-glass-table">
                        <thead>
                          <tr>
                            <th>Subsystem</th>
                            <th>Target Port</th>
                            <th>Uptime SLA</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontFamily: "Fira Code" }}>Express Backend API</td>
                            <td>5000</td>
                            <td>99.98%</td>
                            <td><span className="badge-status badge-approved">HEALTHY</span></td>
                          </tr>
                          <tr>
                            <td style={{ fontFamily: "Fira Code" }}>Socket.io Broker Node</td>
                            <td>5000 (ws)</td>
                            <td>99.95%</td>
                            <td><span className="badge-status badge-approved">HEALTHY</span></td>
                          </tr>
                          <tr>
                            <td style={{ fontFamily: "Fira Code" }}>MongoDB Atlas Replica Cluster</td>
                            <td>27017 (URI)</td>
                            <td>100.00%</td>
                            <td><span className="badge-status badge-approved">HEALTHY</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* NODE 14: COMPLIANCE & LEGAL                                  */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "compliance" && (
                <div className="admin-card-glass">
                  <h2>Food Security FSSAI License Registry</h2>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
                    Legally required FSSAI registrations and health audit records for merchants registered on the instaMeal networks.
                  </p>
                  <div className="glass-table-wrapper">
                    <table className="admin-glass-table">
                      <thead>
                        <tr>
                          <th>Merchant Node</th>
                          <th>FSSAI License ID</th>
                          <th>Registry Status</th>
                          <th>Audit timestamp</th>
                          <th>Compliance Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complianceLogs.map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontWeight: 600 }}>{log.name}</td>
                            <td style={{ fontFamily: "Fira Code" }}>{log.fssai}</td>
                            <td>
                              <span className={`badge-status badge-${log.status}`}>
                                {log.status}
                              </span>
                            </td>
                            <td>{log.auditDate}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {log.status !== "verified" && (
                                  <button className="btn-action-small btn-action-approve" onClick={() => handleVerifyFssai(log.id, "verified")}>
                                    Verify Registry
                                  </button>
                                )}
                                {log.status === "verified" && (
                                  <button className="btn-action-small btn-action-ban" onClick={() => handleVerifyFssai(log.id, "pending")}>
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
