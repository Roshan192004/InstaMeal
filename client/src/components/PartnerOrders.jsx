import { useState } from "react";

const API = "http://localhost:5000/api/partner";
const token = () => localStorage.getItem("token");
const hdr = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const STATUS_BADGE = {
  confirmed: "badge-confirmed", preparing: "badge-preparing",
  picked_up: "badge-picked_up", delivered: "badge-delivered", cancelled: "badge-cancelled",
};
const STATUS_LABEL = {
  confirmed: "⚡ New Order", preparing: "🍳 Preparing", picked_up: "🛵 Picked Up",
  delivered: "✅ Delivered", cancelled: "❌ Cancelled",
};

export default function PartnerOrders({ orders, onRefresh }) {
  const [prepTimes, setPrepTimes] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState("active");

  const filtered = orders.filter(o =>
    tab === "active"
      ? ["confirmed", "preparing"].includes(o.status)
      : tab === "history"
      ? ["delivered", "cancelled"].includes(o.status)
      : true
  );

  async function accept(orderId) {
    await fetch(`${API}/orders/${orderId}/accept`, {
      method: "PATCH", headers: hdr(),
      body: JSON.stringify({ prepTime: prepTimes[orderId] || 20 }),
    });
    onRefresh();
  }

  async function reject(orderId) {
    await fetch(`${API}/orders/${orderId}/reject`, {
      method: "PATCH", headers: hdr(),
      body: JSON.stringify({ reason: rejectReason || "Rejected by restaurant" }),
    });
    setRejectModal(null); setRejectReason(""); onRefresh();
  }

  async function markReady(orderId) {
    await fetch(`${API}/orders/${orderId}/ready`, { method: "PATCH", headers: hdr() });
    onRefresh();
  }

  return (
    <div className="partner-section">
      <div className="section-toolbar">
        <h2 className="section-title"><span className="section-icon">🧾</span> Orders</h2>
        <div className="filter-tabs">
          {["active","all","history"].map(t => (
            <button key={t} className={`filter-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==="active" && orders.filter(o=>["confirmed","preparing"].includes(o.status)).length > 0 &&
                <span style={{marginLeft:6,background:"#ff6b35",borderRadius:"50%",padding:"1px 6px",fontSize:"0.7rem",color:"#fff"}}>
                  {orders.filter(o=>["confirmed","preparing"].includes(o.status)).length}
                </span>
              }
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><p>No orders here yet</p></div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order._id} className={`order-card ${order.status === "confirmed" ? "incoming" : order.status}`}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span className={`order-status-badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                  <span style={{fontSize:"0.78rem",color:"#666"}}>#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="order-customer">
                  👤 {order.user?.name || "Customer"} {order.user?.phone && `· ${order.user.phone}`}
                </div>
                <div className="order-items">
                  {order.items.map(i=>`${i.name} ×${i.quantity}`).join(", ")}
                </div>
                <div className="order-meta">
                  <span>💰 <strong>₹{order.totalPrice}</strong></span>
                  <span>📦 {order.items.length} item{order.items.length!==1?"s":""}</span>
                  <span>🕐 {new Date(order.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
                  {order.address?.street && <span>📍 {order.address.street}</span>}
                </div>
              </div>

              {order.status === "confirmed" && (
                <div className="order-actions">
                  <select className="prep-select" value={prepTimes[order._id]||20}
                    onChange={e=>setPrepTimes(p=>({...p,[order._id]:+e.target.value}))}>
                    {[10,15,20,25,30,45,60].map(m=>(
                      <option key={m} value={m}>{m} min prep</option>
                    ))}
                  </select>
                  <button className="btn btn-accept" onClick={()=>accept(order._id)}>✓ Accept</button>
                  <button className="btn btn-reject" onClick={()=>setRejectModal(order._id)}>✕ Reject</button>
                </div>
              )}
              {order.status === "preparing" && (
                <div className="order-actions">
                  <div style={{fontSize:"0.78rem",color:"#3b82f6",marginBottom:6}}>🍳 Prep: {order.prepTime||20} min</div>
                  <button className="btn btn-ready" onClick={()=>markReady(order._id)}>🔔 Mark Ready</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={()=>setRejectModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-title">❌ Reject Order #{rejectModal.slice(-6).toUpperCase()}</h3>
            <div className="form-group">
              <label className="form-label">Reason for rejection</label>
              <select className="form-select" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}>
                <option value="">Item unavailable</option>
                <option value="Too busy right now">Too busy right now</option>
                <option value="Restaurant closing soon">Restaurant closing soon</option>
                <option value="Delivery not available in area">Delivery not available in area</option>
                <option value="Custom">Other</option>
              </select>
            </div>
            {rejectReason === "Custom" && (
              <div className="form-group">
                <textarea className="form-textarea" placeholder="Enter reason..."
                  onChange={e=>setRejectReason(e.target.value)} />
              </div>
            )}
            <p style={{fontSize:"0.8rem",color:"#ef4444",marginBottom:0}}>⚠️ Customer will be auto-refunded. A penalty may be logged.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>reject(rejectModal)}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
