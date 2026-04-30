import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./Tracking.css";

const STATUS_STEPS = [
  { key: "confirmed",  label: "Confirmed",   emoji: "✅", desc: "Order received by restaurant" },
  { key: "preparing",  label: "Preparing",   emoji: "👨‍🍳", desc: "Chef is cooking your food" },
  { key: "picked_up",  label: "Picked Up",   emoji: "🛵", desc: "Rider has picked up your order" },
  { key: "arriving",   label: "Arriving",    emoji: "📍", desc: "Rider is on the way to you" },
  { key: "delivered",  label: "Delivered",   emoji: "🎉", desc: "Enjoy your meal!" },
];

function getStepIndex(status) {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

// Simple map placeholder (replace with Google Maps embed or Leaflet when API key is available)
function RiderMap({ riderLocation, deliveryAddress }) {
  return (
    <div className="rider-map-placeholder">
      <div className="map-bg">
        <div className="map-grid"></div>
        <div className="map-roads">
          <div className="road road-h"></div>
          <div className="road road-v"></div>
        </div>
        {/* Rider pin */}
        <div className="rider-pin" style={{ left: "45%", top: "40%" }}>
          <div className="rider-pin-pulse"></div>
          <div className="rider-pin-icon">🛵</div>
        </div>
        {/* Destination pin */}
        <div className="dest-pin" style={{ left: "65%", top: "60%" }}>
          <div className="dest-pin-icon">📍</div>
          <span className="dest-label">Your location</span>
        </div>
      </div>
      <div className="map-overlay-info">
        <span>🗺️ Live tracking map</span>
        {riderLocation?.lat
          ? <span className="map-coords">Rider @ {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}</span>
          : <span className="map-coords">Locating rider…</span>
        }
      </div>
    </div>
  );
}

export default function Tracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("confirmed");
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState("25-35 min");

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrder(data);
        setStatus(data.status || "confirmed");
        if (data.riderLocation?.lat) setRiderLocation(data.riderLocation);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Socket.IO for live updates
  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinOrderRoom", orderId);

    socket.on("orderStatus", ({ orderId: oid, status: newStatus }) => {
      if (oid === orderId) {
        setStatus(newStatus);
        const stepIdx = getStepIndex(newStatus);
        const etas = ["30-40 min", "20-30 min", "15-20 min", "5-10 min", "Delivered!"];
        setEta(etas[stepIdx] || "Calculating…");
      }
    });

    socket.on("riderLocation", ({ orderId: oid, lat, lng }) => {
      if (oid === orderId) {
        setRiderLocation({ lat, lng });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const currentStep = getStepIndex(status);
  const isDelivered = status === "delivered";

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="tracking-spinner"></div>
        <p>Loading your order…</p>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">

        {/* Header */}
        <div className="tracking-header">
          <button className="tracking-back-btn" onClick={() => navigate("/orders")}>← My Orders</button>
          <div className="tracking-title-row">
            <h1 className="tracking-title">Live Tracking</h1>
            <div className={`order-status-badge status-${status}`}>
              {STATUS_STEPS[currentStep]?.emoji} {STATUS_STEPS[currentStep]?.label}
            </div>
          </div>
          <p className="order-id-text">Order ID: <code>#{orderId.slice(-8).toUpperCase()}</code></p>
        </div>

        {/* ETA Banner */}
        {!isDelivered && (
          <div className="eta-banner">
            <div className="eta-icon">🕐</div>
            <div>
              <div className="eta-label">Estimated Arrival</div>
              <div className="eta-time">{eta}</div>
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="delivered-banner">
            🎉 Your order has been delivered! Enjoy your meal!
          </div>
        )}

        {/* Map */}
        <div className="tracking-map-wrapper">
          <RiderMap riderLocation={riderLocation} deliveryAddress={order?.address} />
        </div>

        {/* Status Progress Bar */}
        <div className="status-progress-card">
          <h3 className="status-progress-title">Order Status</h3>
          <div className="status-steps">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step.key} className="status-step-wrapper">
                  <div className={`status-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                    <div className={`step-circle ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                      {isDone ? <span className="step-check">✓</span> : <span className="step-num">{idx + 1}</span>}
                      {isActive && <div className="step-pulse"></div>}
                    </div>
                    <div className="step-info">
                      <div className="step-emoji">{step.emoji}</div>
                      <div className="step-label">{step.label}</div>
                      <div className="step-desc">{step.desc}</div>
                    </div>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`step-connector ${idx < currentStep ? "done" : ""}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Summary */}
        {order?.items && order.items.length > 0 && (
          <div className="tracking-order-summary">
            <h3>Your Order</h3>
            <div className="tracking-items">
              {order.items.map((item, i) => (
                <div key={i} className="tracking-item-row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="tracking-total-row">
              <span>Total Paid</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="tracking-actions">
          <button className="btn-view-orders" onClick={() => navigate("/orders")}>
            📦 View All Orders
          </button>
          {isDelivered && (
            <button className="btn-rate-order" onClick={() => navigate("/orders")}>
              ⭐ Rate Your Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
