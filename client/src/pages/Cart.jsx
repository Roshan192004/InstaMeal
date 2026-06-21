import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const DELIVERY_FEE = 30;

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState({ street: "", city: "" });
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartTotal;
  const deliveryFee = cartItems.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  // --- COUPON ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg({ text: "", type: "" });
    try {
      const res = await fetch("http://localhost:5000/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setCouponMsg({ text: `✅ ${data.description} — ₹${data.discount} off!`, type: "success" });
      } else {
        setDiscount(0);
        setCouponMsg({ text: `❌ ${data.message}`, type: "error" });
      }
    } catch {
      setCouponMsg({ text: "❌ Failed to validate coupon", type: "error" });
    } finally {
      setCouponLoading(false);
    }
  };

  // --- RAZORPAY PAYMENT ---
  const handlePayment = async () => {
    if (!address.street || !address.city) {
      alert("Please enter your delivery address");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Create Razorpay order
      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const orderData = await orderRes.json();

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "InstaMeal",
        description: "Food Order Payment",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // 3. Verify payment
            const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              // 4. Place order in our DB
              const placeRes = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  items: cartItems.map(i => ({
                    menuItemId: i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.qty,
                    image: i.image,
                  })),
                  totalPrice: grandTotal,
                  deliveryFee,
                  discount,
                  coupon: couponCode,
                  paymentId: verifyData.paymentId,
                  address,
                  restaurantId: cartItems[0]?.restaurant,
                }),
              });
              const placedOrder = await placeRes.json();
              clearCart();
              navigate(`/tracking/${placedOrder._id}`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            alert("Something went wrong after payment. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#FF0080" },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      // Load Razorpay script if needed
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      // Fallback: place order without payment (dev mode / no Razorpay keys)
      alert(`Razorpay not configured yet. Add RAZORPAY_KEY_ID to server .env to enable payments.\n\nDev mode: placing order without payment.`);
      try {
        const token = localStorage.getItem("token");
        const placeRes = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            items: cartItems.map(i => ({ menuItemId: i._id, name: i.name, price: i.price, quantity: i.qty, image: i.image })),
            totalPrice: grandTotal,
            deliveryFee,
            discount,
            coupon: couponCode,
            paymentId: "dev_mode",
            address,
            restaurantId: cartItems[0]?.restaurant,
          }),
        });
        const placedOrder = await placeRes.json();
        clearCart();
        navigate(`/tracking/${placedOrder._id}`);
      } catch (e) {
        alert("Failed to place order: " + e.message);
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add items from a restaurant to get started</p>
        <button className="btn-back-home" onClick={() => navigate("/")}>Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <button className="cart-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="cart-title">Your Cart 🛒</h1>

        <div className="cart-layout">
          {/* LEFT: items + address + coupon */}
          <div className="cart-left">

            {/* Cart items */}
            <div className="cart-section">
              <h3 className="cart-section-title">Order Items</h3>
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item._id} className="cart-item-row">
                    <div className="cart-item-row-left">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="cart-item-thumb" />
                        : <div className="cart-item-thumb-placeholder">🍽️</div>
                      }
                      <div>
                        <div className="cart-item-row-name">{item.name}</div>
                        <div className="cart-item-row-price">₹{item.price} each</div>
                      </div>
                    </div>
                    <div className="cart-item-row-right">
                      <div className="cart-item-qty">
                        <button className="qty-dec" onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button className="qty-inc" onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                      </div>
                      <div className="cart-item-subtotal">₹{item.price * item.qty}</div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item._id)} title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="cart-section">
              <h3 className="cart-section-title">📍 Delivery Address</h3>
              <div className="address-form">
                <div className="address-field">
                  <label>Street / Building / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. 12B, Rose Apartments, MG Road"
                    value={address.street}
                    onChange={e => setAddress(p => ({ ...p, street: e.target.value }))}
                  />
                  {/* TODO: Add Google Maps Places Autocomplete with GOOGLE_MAPS_API_KEY */}
                </div>
                <div className="address-field">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    value={address.city}
                    onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="cart-section">
              <h3 className="cart-section-title">🎟️ Promo Code</h3>
              <p className="coupon-hint">Try: WELCOME10 · FLAT50 · SAVE20 · INSTAFOOD</p>
              <div className="coupon-row">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg({ text: "", type: "" }); setDiscount(0); }}
                />
                <button className="coupon-apply-btn" onClick={handleApplyCoupon} disabled={couponLoading}>
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
              {couponMsg.text && (
                <p className={`coupon-msg ${couponMsg.type}`}>{couponMsg.text}</p>
              )}
            </div>
          </div>

          {/* RIGHT: Order summary + pay button */}
          <div className="cart-right">
            <div className="order-summary-card">
              <h3 className="order-summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Promo Discount ({couponCode})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>

              <div className="payment-info">
                <div className="payment-badge">🔒 Secured by Razorpay</div>
              </div>

              <button
                className="pay-btn"
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing…" : `Pay ₹${grandTotal} →`}
              </button>

              <p className="pay-note">You'll be redirected to a secure payment page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}