import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import PartnerOrders from "../components/PartnerOrders";
import PartnerMenu from "../components/PartnerMenu";
import "./PartnerDashboard.css";

const API = "http://localhost:5000/api/partner";
const hdr = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const NAV = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "orders", icon: "🧾", label: "Orders" },
  { id: "menu", icon: "🍽️", label: "Menu" },
  { id: "timing", icon: "⏰", label: "Timing & Control" },
  { id: "offers", icon: "🏷️", label: "Offers" },
  { id: "earnings", icon: "💰", label: "Earnings" },
  { id: "reviews", icon: "⭐", label: "Reviews" },
];

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [obForm, setObForm] = useState({ name: "", cuisine: "", deliveryTime: "30-40 min", deliveryFee: 30, minimumOrder: 100 });
  const [offerForm, setOfferForm] = useState({ title: "", description: "", type: "discount", value: "", minOrder: "" });
  const [hours, setHours] = useState({ open: "09:00", close: "22:00" });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const incoming = orders.filter(o => o.status === "confirmed").length;

  const load = useCallback(async () => {
    try {
      const [rRes, mRes, oRes, eRes, rvRes] = await Promise.all([
        fetch(`${API}/restaurant`, { headers: hdr() }),
        fetch(`${API}/menu`, { headers: hdr() }),
        fetch(`${API}/orders`, { headers: hdr() }),
        fetch(`${API}/earnings`, { headers: hdr() }),
        fetch(`${API}/reviews`, { headers: hdr() }),
      ]);
      if (rRes.status === 404) { setLoading(false); return; }
      const r = await rRes.json();
      setRestaurant(r);
      setHours(r.openingHours || { open: "09:00", close: "22:00" });
      if (mRes.ok) setMenu(await mRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (eRes.ok) setEarnings(await eRes.json());
      if (rvRes.ok) setReviews(await rvRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, [load]);

  async function createRestaurant() {
    setSaving(true);
    const res = await fetch(`${API}/restaurant`, { method: "POST", headers: hdr(), body: JSON.stringify(obForm) });
    if (res.ok) { setOnboarding(false); load(); }
    setSaving(false);
  }

  async function toggleOpen() {
    await fetch(`${API}/restaurant/toggle`, { method: "PATCH", headers: hdr() });
    load();
  }

  async function toggleHoliday() {
    await fetch(`${API}/restaurant`, { method: "PUT", headers: hdr(), body: JSON.stringify({ holidayMode: !restaurant.holidayMode }) });
    load();
  }

  async function saveHours() {
    setSaving(true);
    await fetch(`${API}/restaurant`, { method: "PUT", headers: hdr(), body: JSON.stringify({ openingHours: hours }) });
    setSaving(false); load();
  }

  async function addOffer() {
    if (!offerForm.title || !offerForm.value) return;
    const existing = restaurant.offers || [];
    await fetch(`${API}/restaurant`, { method: "PUT", headers: hdr(), body: JSON.stringify({ offers: [...existing, { ...offerForm, value: +offerForm.value, minOrder: +offerForm.minOrder || 0, isActive: true }] }) });
    setOfferForm({ title: "", description: "", type: "discount", value: "", minOrder: "" }); load();
  }

  async function removeOffer(idx) {
    const offers = (restaurant.offers || []).filter((_, i) => i !== idx);
    await fetch(`${API}/restaurant`, { method: "PUT", headers: hdr(), body: JSON.stringify({ offers }) });
    load();
  }

  async function toggleOffer(idx) {
    const offers = (restaurant.offers || []).map((o, i) => i === idx ? { ...o, isActive: !o.isActive } : o);
    await fetch(`${API}/restaurant`, { method: "PUT", headers: hdr(), body: JSON.stringify({ offers }) });
    load();
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API}/restaurant/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
      }
    } catch (err) {
      console.error(err);
    }
    setUploadingImage(false);
  }

  const Stars = ({ n }) => (
    <div className="stars">{[1,2,3,4,5].map(i => <span key={i} className={`star ${i<=Math.round(n)?"":"empty"}`}>★</span>)}</div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0f", color: "#ff6b35", fontSize: "1.1rem" }}>
      🍽️ Loading Partner Dashboard…
    </div>
  );

  if (!restaurant && !onboarding) return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="onboarding-card">
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏪</div>
        <h2>Register Your Restaurant</h2>
        <p>Join InstaMeal as a restaurant partner and start receiving orders today.</p>
        <button className="btn btn-primary" style={{ padding: "12px 32px", fontSize: "1rem" }} onClick={() => setOnboarding(true)}>Get Started →</button>
      </div>
    </div>
  );

  if (onboarding) return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="onboarding-card" style={{ maxWidth: 520, textAlign: "left" }}>
        <h2 style={{ marginBottom: 4 }}>🏪 Restaurant Onboarding</h2>
        <p style={{ marginBottom: 20 }}>Fill in your details to go live on InstaMeal.</p>
        {[["Restaurant Name", "name", "text", "e.g. Spice Garden"], ["Cuisine Type", "cuisine", "text", "e.g. North Indian"], ["Delivery Time", "deliveryTime", "text", "e.g. 30-40 min"]].map(([label, key, type, ph]) => (
          <div className="form-group" key={key}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type} value={obForm[key]} placeholder={ph} onChange={e => setObForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Delivery Fee (₹)</label>
            <input className="form-input" type="number" value={obForm.deliveryFee} onChange={e => setObForm(f => ({ ...f, deliveryFee: +e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Order (₹)</label>
            <input className="form-input" type="number" value={obForm.minimumOrder} onChange={e => setObForm(f => ({ ...f, minimumOrder: +e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={() => setOnboarding(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={createRestaurant} disabled={saving}>{saving ? "Submitting…" : "Submit for Review"}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="partner-root">
      {/* SIDEBAR */}
      <aside className="partner-sidebar">
        <div className="partner-logo">
          <h2>⚡ InstaMeal</h2>
          <span>Partner Dashboard</span>
        </div>
        <nav className="partner-nav">
          {NAV.map(n => (
            <div key={n.id} className={`partner-nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id === "orders" && incoming > 0 && <span className="partner-nav-badge">{incoming}</span>}
            </div>
          ))}
        </nav>
        <div className="partner-status-pill">
          <div className="status-toggle-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className={`status-dot ${restaurant.isOpen && !restaurant.holidayMode ? "open" : "closed"}`} />
              <span className="status-label" style={{ color: restaurant.isOpen && !restaurant.holidayMode ? "#22c55e" : "#ef4444" }}>
                {restaurant.holidayMode ? "Holiday Mode" : restaurant.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={restaurant.isOpen && !restaurant.holidayMode} onChange={toggleOpen} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#555", marginTop: 6 }}>{restaurant.name}</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="partner-main">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            <div className="partner-header">
              <div>
                <h1>Welcome back 👋</h1>
                <p>{restaurant.name} · {restaurant.cuisine} · {restaurant.status === "pending" ? "⏳ Awaiting approval" : "✅ Live"}</p>
              </div>
            </div>
            
            <div className="shop-photo-section" style={{ background: "#13131a", padding: "20px", borderRadius: "12px", marginBottom: "24px", display: "flex", gap: "20px", alignItems: "center" }}>
              <div className="shop-photo-preview" style={{ width: "120px", height: "120px", borderRadius: "8px", overflow: "hidden", background: "#1a1a26", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {restaurant.image ? (
                  <img src={restaurant.image.startsWith("http") ? restaurant.image : `http://localhost:5000${restaurant.image}`} alt="Shop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "2rem" }}>🏪</span>
                )}
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Shop Photo</h3>
                <p style={{ color: "#888", fontSize: "0.9rem", margin: "0 0 16px 0" }}>Upload a high-quality photo of your shop to help customers recognize you.</p>
                <label className="btn btn-primary" style={{ cursor: "pointer", display: "inline-block" }}>
                  {uploadingImage ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            {restaurant.status === "pending" && (
              <div className="alert-banner warning">⏳ Your restaurant is under review. You'll go live once approved by our team.</div>
            )}
            {incoming > 0 && (
              <div className="alert-banner info" style={{ cursor: "pointer" }} onClick={() => setTab("orders")}>
                🔔 {incoming} new order{incoming > 1 ? "s" : ""} waiting for your response! Click to view →
              </div>
            )}
            <div className="stats-grid">
              <div className="stat-card orange">
                <div className="stat-card-label">Today's Orders</div>
                <div className="stat-card-value">{earnings?.todayOrders ?? "—"}</div>
                <div className="stat-card-sub">↑ from yesterday</div>
              </div>
              <div className="stat-card green">
                <div className="stat-card-label">Today's Revenue</div>
                <div className="stat-card-value">₹{earnings?.todayRevenue ?? "—"}</div>
                <div className="stat-card-sub">After platform fee</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-card-label">Total Orders</div>
                <div className="stat-card-value">{earnings?.totalOrders ?? "—"}</div>
                <div className="stat-card-sub">All time</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-card-label">Avg Rating</div>
                <div className="stat-card-value">{earnings?.avgRestaurantRating ?? restaurant.rating ?? "—"} ⭐</div>
                <div className="stat-card-sub">{earnings?.totalRatings ?? 0} reviews</div>
              </div>
            </div>
            <div className="earnings-grid">
              <div className="earnings-card">
                <h3>Net Earnings (All Time)</h3>
                <div className="earnings-amount">₹{earnings?.netEarnings?.toLocaleString("en-IN") ?? "—"}</div>
                <div className="commission-bar">
                  <div className="bar-label"><span>Your share (78%)</span><span>Platform (22%)</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "78%", background: "linear-gradient(90deg,#22c55e,#16a34a)" }} /></div>
                </div>
              </div>
              <div className="earnings-card">
                <h3>🏆 Top Items</h3>
                <div className="top-items-list">
                  {(earnings?.topItems ?? []).map((item, i) => (
                    <div key={i} className="top-item-row">
                      <span className="top-item-rank">#{i + 1}</span>
                      <span className="top-item-name">{item.name}</span>
                      <span className="top-item-count">{item.count}x</span>
                    </div>
                  ))}
                  {(!earnings?.topItems?.length) && <p style={{ color: "#555", fontSize: "0.85rem" }}>No orders yet</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ORDERS */}
        {tab === "orders" && <PartnerOrders orders={orders} onRefresh={load} />}

        {/* MENU */}
        {tab === "menu" && <PartnerMenu menu={menu} onRefresh={load} />}

        {/* TIMING */}
        {tab === "timing" && (
          <div className="partner-section">
            <h2 className="section-title"><span className="section-icon">⏰</span> Timing & Control</h2>
            <div className="timing-grid">
              <div className="timing-card">
                <h3>Opening Hours</h3>
                <div className="time-row">
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Opens at</label>
                    <input className="form-input" type="time" value={hours.open} onChange={e => setHours(h => ({ ...h, open: e.target.value }))} />
                  </div>
                  <div style={{ color: "#555", marginTop: 28 }}>—</div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Closes at</label>
                    <input className="form-input" type="time" value={hours.close} onChange={e => setHours(h => ({ ...h, close: e.target.value }))} />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={saveHours} disabled={saving}>{saving ? "Saving…" : "Save Hours"}</button>
              </div>
              <div className="timing-card">
                <h3>Restaurant Status</h3>
                <div className="holiday-toggle-row" style={{ marginBottom: 12 }}>
                  <div className="holiday-toggle-info">
                    <h4>Online / Offline</h4>
                    <p>Instantly go offline to stop new orders</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={!!restaurant.isOpen} onChange={toggleOpen} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="holiday-toggle-row">
                  <div className="holiday-toggle-info">
                    <h4>🏖️ Holiday Mode</h4>
                    <p>Pause orders for an extended period</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={!!restaurant.holidayMode} onChange={toggleHoliday} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFERS */}
        {tab === "offers" && (
          <div className="partner-section">
            <h2 className="section-title"><span className="section-icon">🏷️</span> Offers & Discounts</h2>
            <div className="earnings-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, color: "#e8e8f0", fontSize: "0.95rem" }}>➕ Create New Offer</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Offer Title</label>
                  <input className="form-input" value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Weekend Special" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={offerForm.type} onChange={e => setOfferForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="discount">% Discount</option>
                    <option value="flat_off">Flat ₹ Off</option>
                    <option value="bogo">Buy 1 Get 1</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Value {offerForm.type === "discount" ? "(% off)" : "(₹)"}</label>
                  <input className="form-input" type="number" value={offerForm.value} onChange={e => setOfferForm(f => ({ ...f, value: e.target.value }))} placeholder="20" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order (₹)</label>
                  <input className="form-input" type="number" value={offerForm.minOrder} onChange={e => setOfferForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="199" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} placeholder="Short promo text..." />
              </div>
              <button className="btn btn-primary" onClick={addOffer}>Launch Offer 🚀</button>
            </div>
            <div className="offers-grid">
              {(restaurant.offers || []).map((offer, i) => (
                <div key={i} className={`offer-card ${offer.isActive ? "active-offer" : ""}`}>
                  <span className="offer-type-badge" style={{ background: offer.type === "bogo" ? "rgba(168,85,247,0.15)" : "rgba(255,107,53,0.15)", color: offer.type === "bogo" ? "#a855f7" : "#ff6b35" }}>
                    {offer.type.replace("_", " ")}
                  </span>
                  <div className="offer-title">{offer.title}</div>
                  <div className="offer-desc">{offer.description}</div>
                  <div style={{ fontSize: "0.85rem", color: "#ff6b35", fontWeight: 700, marginBottom: 12 }}>
                    {offer.type === "discount" ? `${offer.value}% OFF` : offer.type === "flat_off" ? `₹${offer.value} OFF` : offer.type === "bogo" ? "BUY 1 GET 1" : "FREE DELIVERY"}
                    {offer.minOrder > 0 && <span style={{ color: "#666", fontWeight: 400, marginLeft: 8 }}>min ₹{offer.minOrder}</span>}
                  </div>
                  <div className="offer-actions">
                    <button className={`btn btn-sm ${offer.isActive ? "btn-secondary" : "btn-accept"}`} onClick={() => toggleOffer(i)}>
                      {offer.isActive ? "⏸ Pause" : "▶ Activate"}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeOffer(i)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {(!restaurant.offers?.length) && (
                <div className="empty-state"><div className="empty-icon">🏷️</div><p>No offers yet. Create your first deal!</p></div>
              )}
            </div>
          </div>
        )}

        {/* EARNINGS */}
        {tab === "earnings" && (
          <div className="partner-section">
            <h2 className="section-title"><span className="section-icon">💰</span> Earnings Dashboard</h2>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {[
                { label: "Total Revenue", val: `₹${earnings?.totalRevenue?.toLocaleString("en-IN") ?? 0}`, cls: "orange" },
                { label: "Net Earnings (78%)", val: `₹${earnings?.netEarnings?.toLocaleString("en-IN") ?? 0}`, cls: "green" },
                { label: "Platform Commission", val: `₹${earnings?.commission?.toLocaleString("en-IN") ?? 0}`, cls: "purple" },
                { label: "This Week", val: `₹${earnings?.weekRevenue?.toLocaleString("en-IN") ?? 0}`, cls: "blue" },
              ].map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`}>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value">{s.val}</div>
                </div>
              ))}
            </div>
            <div className="earnings-grid">
              <div className="earnings-card">
                <h3>Commission & Settlement</h3>
                <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 16 }}>Platform deducts 22% commission. Net earnings are transferred weekly to your bank account.</p>
                <div className="commission-bar">
                  <div className="bar-label"><span style={{ color: "#22c55e" }}>Your earnings 78%</span><span style={{ color: "#a855f7" }}>Platform 22%</span></div>
                  <div className="bar-track" style={{ height: 12 }}>
                    <div className="bar-fill" style={{ width: "78%", background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Total Orders</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e8e8f0" }}>{earnings?.totalOrders ?? 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Cancelled</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ef4444" }}>{earnings?.cancelledOrders ?? 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Avg Rating</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fbbf24" }}>{earnings?.avgRestaurantRating ?? "—"} ⭐</div>
                  </div>
                </div>
              </div>
              <div className="earnings-card">
                <h3>🏆 Top Selling Items</h3>
                <div className="top-items-list">
                  {(earnings?.topItems ?? []).map((item, i) => (
                    <div key={i} className="top-item-row">
                      <span className="top-item-rank">#{i + 1}</span>
                      <span className="top-item-name">{item.name}</span>
                      <div style={{ flex: 1, height: 6, background: "#1a1a26", borderRadius: 3, margin: "0 12px" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "#ff6b35", width: `${Math.min(100, (item.count / (earnings.topItems[0]?.count || 1)) * 100)}%` }} />
                      </div>
                      <span className="top-item-count">{item.count}x</span>
                    </div>
                  ))}
                  {(!earnings?.topItems?.length) && <p style={{ color: "#555", fontSize: "0.85rem" }}>No orders yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div className="partner-section">
            <h2 className="section-title"><span className="section-icon">⭐</span> Reviews & Ratings</h2>
            {reviews.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">⭐</div><p>No reviews yet. Keep serving great food!</p></div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div>
                        <div className="review-customer">👤 {review.user?.name || "Customer"}</div>
                        <div className="review-date">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div><div style={{ fontSize: "0.65rem", color: "#666" }}>Food</div><Stars n={review.rating?.food} /></div>
                          <div><div style={{ fontSize: "0.65rem", color: "#666" }}>Restaurant</div><Stars n={review.rating?.restaurant} /></div>
                          <div><div style={{ fontSize: "0.65rem", color: "#666" }}>Rider</div><Stars n={review.rating?.rider} /></div>
                        </div>
                      </div>
                    </div>
                    <div className="review-items">🛒 {review.items?.map(i => i.name).join(", ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
