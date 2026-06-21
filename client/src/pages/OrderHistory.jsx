import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./OrderHistory.css";

const STATUS_LABELS = {
  confirmed:  { label: "Confirmed",  color: "blue" },
  preparing:  { label: "Preparing",  color: "yellow" },
  picked_up:  { label: "Picked Up",  color: "purple" },
  arriving:   { label: "Arriving",   color: "orange" },
  delivered:  { label: "Delivered",  color: "green" },
  cancelled:  { label: "Cancelled",  color: "red" },
};

// PDF invoice generator using jsPDF
async function downloadInvoice(order) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Header
    doc.setFillColor(255, 77, 0);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("InstaMeal", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Food Delivery Invoice", 14, 25);

    // Order info
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 14, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Order ID: #${order._id?.slice(-8).toUpperCase()}`, 14, 52);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`, 14, 59);
    doc.text(`Status: ${STATUS_LABELS[order.status]?.label || order.status}`, 14, 66);
    if (order.address?.street) {
      doc.text(`Delivery: ${order.address.street}, ${order.address.city}`, 14, 73);
    }

    // Table header
    let y = 85;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 6, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Item", 16, y);
    doc.text("Qty", 120, y);
    doc.text("Price", 145, y);
    doc.text("Total", 170, y);
    y += 6;

    // Table rows
    doc.setFont("helvetica", "normal");
    order.items?.forEach(item => {
      doc.text(item.name.substring(0, 30), 16, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`Rs.${item.price}`, 145, y);
      doc.text(`Rs.${item.price * item.quantity}`, 170, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    // Totals
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    const subtotal = order.totalPrice - (order.deliveryFee || 0) + (order.discount || 0);
    doc.text("Subtotal:", 140, y); doc.text(`Rs.${subtotal}`, 175, y); y += 7;
    doc.text("Delivery Fee:", 140, y); doc.text(`Rs.${order.deliveryFee || 30}`, 175, y); y += 7;
    if (order.discount > 0) {
      doc.setTextColor(16, 185, 129);
      doc.text("Discount:", 140, y); doc.text(`-Rs.${order.discount}`, 175, y);
      doc.setTextColor(30, 30, 30);
      y += 7;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 140, y); doc.text(`Rs.${order.totalPrice}`, 175, y);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for ordering with InstaMeal!", 14, 285);

    doc.save(`InstaMeal_Invoice_${order._id?.slice(-8)}.pdf`);
  } catch (err) {
    alert("Could not generate PDF: " + err.message);
  }
}

// Star rating component
function StarRating({ value, onChange, readOnly }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          className={`star-btn ${value >= star ? "active" : ""}`}
          onClick={() => !readOnly && onChange(star)}
          type="button"
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Rating modal
function RatingModal({ order, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({ food: 0, rider: 0, restaurant: 0 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ratings.food || !ratings.rider || !ratings.restaurant) {
      alert("Please rate all categories");
      return;
    }
    setSubmitting(true);
    await onSubmit(order._id, ratings);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="rating-modal-icon">⭐</div>
        <h2 className="rating-modal-title">Rate Your Experience</h2>
        <p className="rating-modal-sub">Order #{order._id?.slice(-8).toUpperCase()}</p>

        <div className="rating-categories">
          <div className="rating-category">
            <div className="rating-category-label">🍽️ Food Quality</div>
            <StarRating value={ratings.food} onChange={v => setRatings(p => ({ ...p, food: v }))} />
          </div>
          <div className="rating-category">
            <div className="rating-category-label">🛵 Delivery Rider</div>
            <StarRating value={ratings.rider} onChange={v => setRatings(p => ({ ...p, rider: v }))} />
          </div>
          <div className="rating-category">
            <div className="rating-category-label">🏪 Restaurant</div>
            <StarRating value={ratings.restaurant} onChange={v => setRatings(p => ({ ...p, restaurant: v }))} />
          </div>
        </div>

        <button className="rating-submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Rating"}
        </button>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOrder, setRatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    order.items?.forEach(item => {
      addToCart({
        _id: item.menuItemId || item._id || item.name,
        name: item.name,
        price: item.price,
        image: item.image,
      });
      for (let i = 1; i < item.quantity; i++) {
        addToCart({
          _id: item.menuItemId || item._id || item.name,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }
    });
    navigate("/cart");
  };

  const handleRatingSubmit = async (orderId, ratings) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/orders/${orderId}/rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ratings),
      });
      fetchOrders(); // Refresh
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-spinner"></div>
        <p>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders 📦</h1>
          <p className="orders-sub">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Your order history will appear here once you place an order.</p>
            <button className="btn-browse" onClick={() => navigate("/")}>Browse Restaurants</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "grey" };
              const isDelivered = order.status === "delivered";
              const isRated = order.rating?.isRated;

              return (
                <div key={order._id} className="order-card">
                  {/* Order card header */}
                  <div className="order-card-header">
                    <div className="order-card-header-left">
                      <div className="order-restaurant-name">
                        {order.restaurant?.name || "InstaMeal Order"}
                      </div>
                      <div className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className={`order-status-chip chip-${statusInfo.color}`}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="order-items-summary">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-item-tag">
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <span className="order-item-tag more">+{order.items.length - 3} more</span>
                    )}
                  </div>

                  {/* Order footer */}
                  <div className="order-card-footer">
                    <div className="order-total-info">
                      <span className="order-total-amount">₹{order.totalPrice}</span>
                      <span className="order-items-count">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                      {!isDelivered && order.status !== "cancelled" && order.deliveryOtp && (
                        <span style={{ marginLeft: "12px", background: "#fff0f5", color: "#FF0080", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.85rem" }}>
                          PIN: {order.deliveryOtp}
                        </span>
                      )}
                    </div>

                    <div className="order-actions">
                      {/* Track button for active orders */}
                      {!isDelivered && order.status !== "cancelled" && (
                        <button
                          className="order-action-btn btn-track"
                          onClick={() => navigate(`/tracking/${order._id}`)}
                        >
                          📍 Track
                        </button>
                      )}

                      {/* Re-order */}
                      <button
                        className="order-action-btn btn-reorder"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Re-order
                      </button>

                      {/* Rate — only for delivered, unrated orders */}
                      {isDelivered && !isRated && (
                        <button
                          className="order-action-btn btn-rate"
                          onClick={() => setRatingOrder(order)}
                        >
                          ⭐ Rate
                        </button>
                      )}

                      {isRated && (
                        <div className="rated-badge">✅ Rated</div>
                      )}

                      {/* Invoice download */}
                      {isDelivered && (
                        <button
                          className="order-action-btn btn-invoice"
                          onClick={() => downloadInvoice(order)}
                          title="Download Invoice"
                        >
                          📄 Invoice
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show existing ratings if rated */}
                  {isRated && order.rating && (
                    <div className="existing-rating">
                      <span>Food: {'★'.repeat(order.rating.food)}{'☆'.repeat(5 - order.rating.food)}</span>
                      <span>Rider: {'★'.repeat(order.rating.rider)}{'☆'.repeat(5 - order.rating.rider)}</span>
                      <span>Restaurant: {'★'.repeat(order.rating.restaurant)}{'☆'.repeat(5 - order.rating.restaurant)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingOrder && (
        <RatingModal
          order={ratingOrder}
          onClose={() => setRatingOrder(null)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
