import { useState } from "react";

const API = "http://localhost:5000/api/partner";
const hdr = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const EMPTY_ITEM = { name: "", description: "", price: "", category: "", image: "", isVeg: false, isAvailable: true };

export default function PartnerMenu({ menu, onRefresh }) {
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(EMPTY_ITEM);
  const [editId, setEditId] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [saving, setSaving] = useState(false);

  const categories = ["All", ...new Set(menu.map(i => i.category).filter(Boolean))];
  const visible = catFilter === "All" ? menu : menu.filter(i => i.category === catFilter);

  function openAdd() { setForm(EMPTY_ITEM); setEditId(null); setModal("add"); }
  function openEdit(item) { setForm({ name:item.name, description:item.description||"", price:item.price, category:item.category||"", image:item.image||"", isVeg:item.isVeg, isAvailable:item.isAvailable }); setEditId(item._id); setModal("edit"); }

  async function save() {
    if (!form.name || !form.price) return;
    setSaving(true);
    if (modal === "add") {
      await fetch(`${API}/menu`, { method: "POST", headers: hdr(), body: JSON.stringify({ ...form, price: +form.price }) });
    } else {
      await fetch(`${API}/menu/${editId}`, { method: "PUT", headers: hdr(), body: JSON.stringify({ ...form, price: +form.price }) });
    }
    setSaving(false); setModal(null); onRefresh();
  }

  async function del(id) {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`${API}/menu/${id}`, { method: "DELETE", headers: hdr() });
    onRefresh();
  }

  async function toggle(id) {
    await fetch(`${API}/menu/${id}/toggle`, { method: "PATCH", headers: hdr() });
    onRefresh();
  }

  const inp = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="partner-section">
      <div className="section-toolbar">
        <h2 className="section-title"><span className="section-icon">🍽️</span> Menu Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        {categories.map(c => (
          <button key={c} className={`filter-tab ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🍴</div><p>No items yet. Add your first menu item!</p></div>
      ) : (
        <div className="menu-grid">
          {visible.map(item => (
            <div key={item._id} className={`menu-item-card ${!item.isAvailable ? "unavailable" : ""}`}>
              <div className="menu-item-img">
                {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🍽️"}
              </div>
              <div className="menu-item-body">
                <div className="menu-item-tags">
                  <span className={item.isVeg ? "tag-veg" : "tag-nonveg"}>{item.isVeg ? "🟢 VEG" : "🔴 NON-VEG"}</span>
                  {!item.isAvailable && <span style={{ fontSize: "0.68rem", color: "#ef4444" }}>SOLD OUT</span>}
                </div>
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-desc">{item.description || "—"}</div>
                {item.category && <div style={{ fontSize: "0.72rem", color: "#666", marginBottom: 8 }}>📂 {item.category}</div>}
                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price}</span>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={item.isAvailable} onChange={() => toggle(item._id)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="menu-item-actions">
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(item)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(item._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal === "add" ? "➕ Add Menu Item" : "✏️ Edit Item"}</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" value={form.name} onChange={inp("name")} placeholder="e.g. Butter Chicken" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" type="number" value={form.price} onChange={inp("price")} placeholder="299" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={inp("description")} placeholder="Short description..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={form.category} onChange={inp("category")} placeholder="e.g. Main Course" />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={form.image} onChange={inp("image")} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 8 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={form.isVeg} onChange={e => setForm(f => ({ ...f, isVeg: e.target.checked }))} />
                🟢 Vegetarian
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                Available now
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : modal === "add" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
