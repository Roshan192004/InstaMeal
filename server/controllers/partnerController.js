const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

// ─── RESTAURANT MANAGEMENT ──────────────────────────────────────────────────

// GET my restaurant (owner's restaurant)
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this owner" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE my restaurant (onboarding)
exports.createMyRestaurant = async (req, res) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ message: "You already have a restaurant" });

    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id, status: "pending" });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE my restaurant (name, hours, image, cuisine, etc.)
exports.updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPLOAD restaurant image
exports.uploadRestaurantImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { image: imageUrl },
      { new: true }
    );
    
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: "Image uploaded successfully", image: imageUrl, restaurant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE online/offline (isOpen)
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({ isOpen: restaurant.isOpen, message: `Restaurant is now ${restaurant.isOpen ? "OPEN" : "CLOSED"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MENU MANAGEMENT ────────────────────────────────────────────────────────

// GET all menu items for owner's restaurant
exports.getMyMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const items = await MenuItem.find({ restaurant: restaurant._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD menu item
exports.addMyMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE menu item
exports.updateMyMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, restaurant: restaurant._id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE menu item
exports.deleteMyMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurant: restaurant._id });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE availability of a menu item
exports.toggleMyMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const item = await MenuItem.findOne({ _id: req.params.itemId, restaurant: restaurant._id });
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ORDER MANAGEMENT ───────────────────────────────────────────────────────

// GET incoming orders for owner's restaurant
exports.getMyOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("user", "name phone email")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ACCEPT order — set prepTime and move to "preparing"
exports.acceptOrder = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const { prepTime } = req.body; // in minutes
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, restaurant: restaurant._id, status: "confirmed" },
      { status: "preparing", prepTime: prepTime || 20 },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found or already processed" });

    // Emit socket update
    req.app.get("io").emit("orderStatus", { orderId: order._id.toString(), status: "preparing" });

    res.json({ message: "Order accepted", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REJECT order — cancel and log penalty
exports.rejectOrder = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const { reason } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, restaurant: restaurant._id, status: "confirmed" },
      { status: "cancelled", rejectionReason: reason || "Rejected by restaurant" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found or already processed" });

    req.app.get("io").emit("orderStatus", { orderId: order._id.toString(), status: "cancelled" });

    res.json({ message: "Order rejected", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK food ready — triggers rider pickup notification
exports.markFoodReady = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, restaurant: restaurant._id, status: "preparing" },
      { status: "ready_for_pickup" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found or not in preparing state" });

    req.app.get("io").emit("orderStatus", { orderId: order._id.toString(), status: "ready_for_pickup" });

    res.json({ message: "Food marked as ready, rider notified", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ANALYTICS / EARNINGS ───────────────────────────────────────────────────

exports.getEarnings = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7);

    const allOrders = await Order.find({
      restaurant: restaurant._id,
      status: { $in: ["delivered", "preparing", "picked_up", "arriving"] }
    });

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfDay);
    const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfWeek);

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Top items
    const itemCounts = {};
    allOrders.forEach(o => {
      o.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    });
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Ratings summary
    const ratedOrders = allOrders.filter(o => o.rating?.isRated);
    const avgRestaurantRating = ratedOrders.length
      ? (ratedOrders.reduce((s, o) => s + (o.rating.restaurant || 0), 0) / ratedOrders.length).toFixed(1)
      : restaurant.rating;

    const cancelledOrders = await Order.countDocuments({ restaurant: restaurant._id, status: "cancelled" });

    res.json({
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      commission: Math.round(totalRevenue * 0.22), // 22% platform cut
      netEarnings: Math.round(totalRevenue * 0.78),
      topItems,
      avgRestaurantRating: parseFloat(avgRestaurantRating),
      cancelledOrders,
      totalRatings: ratedOrders.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET reviews (rated orders with comments)
exports.getMyReviews = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const reviews = await Order.find({ restaurant: restaurant._id, "rating.isRated": true })
      .populate("user", "name")
      .select("rating items createdAt user")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
