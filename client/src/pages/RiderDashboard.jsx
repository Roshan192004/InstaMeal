import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './RiderDashboard.css';

const RiderDashboard = () => {
  const { user } = useAuth();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    aadharNumber: '',
    vehicleRc: '',
    licenseNumber: '',
    accountNumber: '',
    ifscCode: '',
    zone: 'North'
  });

  useEffect(() => {
    fetchRiderProfile();
  }, []);

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
      fetchRiderProfile();
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register rider");
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
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const findOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/rider/accept-order", {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setOrder(res.data.order);
      setRider({ ...rider, status: "on_delivery" });
      alert("Order assigned!");
    } catch (error) {
      alert(error.response?.data?.message || "Error finding order");
    }
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
        fetchRiderProfile(); // Refresh earnings and status
        alert("Order delivered successfully!");
      } else {
        setOrder({ ...order, status });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating order status");
    }
  };

  if (loading) {
    return <div className="rider-dashboard-container">Loading...</div>;
  }

  if (!rider) {
    return (
      <div className="rider-dashboard-container">
        <div className="rider-registration">
          <h2>Register as Delivery Partner</h2>
          <form onSubmit={handleRegister}>
            <input 
              type="text" placeholder="Aadhar Number" required
              value={formData.aadharNumber} onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
            />
            <input 
              type="text" placeholder="Vehicle RC" required
              value={formData.vehicleRc} onChange={(e) => setFormData({...formData, vehicleRc: e.target.value})}
            />
            <input 
              type="text" placeholder="Driving License" required
              value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
            />
            <input 
              type="text" placeholder="Bank Account Number" required
              value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
            />
            <input 
              type="text" placeholder="IFSC Code" required
              value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
            />
            <select value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})}>
              <option value="North">North Zone</option>
              <option value="South">South Zone</option>
              <option value="East">East Zone</option>
              <option value="West">West Zone</option>
            </select>
            <button type="submit" className="register-btn">Submit Application</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rider-dashboard-container">
      <div className="rider-header">
        <h1>Rider Dashboard</h1>
        <div className="status-toggle">
          <span className={`status-badge ${rider.status}`}>{rider.status.replace("_", " ")}</span>
          {rider.status !== "on_delivery" && (
            <button className="toggle-btn" onClick={toggleStatus}>
              Go {rider.status === "online" ? "Offline" : "Online"}
            </button>
          )}
        </div>
      </div>

      <div className="rider-stats">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <div className="value">₹{rider.earnings}</div>
        </div>
        <div className="stat-card">
          <h3>Zone</h3>
          <div className="value" style={{color: '#fff', fontSize: '1.5rem'}}>{rider.zone}</div>
        </div>
      </div>

      <div className="active-order-section">
        {rider.status === "offline" ? (
          <div className="no-order">
            <h2>You are currently offline</h2>
            <p>Go online to start receiving orders.</p>
          </div>
        ) : rider.status === "online" && !order ? (
          <div className="no-order">
            <h2>Looking for nearby orders...</h2>
            <br />
            <button className="find-order-btn" onClick={findOrder}>Find Order</button>
          </div>
        ) : order ? (
          <div className="order-details">
            <h3>Active Delivery</h3>
            
            <div className="location-box">
              <h4>Pickup from: {order.restaurant?.name || "Restaurant"}</h4>
              <p>{order.restaurant?.address?.street || "No address"}</p>
              <p>Phone: {order.restaurant?.phone}</p>
            </div>

            <div className="location-box">
              <h4>Deliver to: {order.user?.name}</h4>
              <p>{order.address?.street}, {order.address?.city}</p>
              <p>Phone: {order.user?.phone}</p>
            </div>

            <div className="order-actions">
              {(order.status === "ready_for_pickup" || order.status === "preparing") && (
                <button className="action-btn btn-primary" onClick={() => updateOrderStatus("picked_up")}>
                  Mark as Picked Up
                </button>
              )}
              
              {order.status === "picked_up" && (
                <button className="action-btn btn-primary" onClick={() => updateOrderStatus("arriving")}>
                  Mark as Arriving
                </button>
              )}

              {(order.status === "picked_up" || order.status === "arriving") && (
                <div className="otp-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Customer OTP" 
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
    </div>
  );
};

export default RiderDashboard;
