const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Rider = require("../models/Rider");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Keep pricing settings and support tickets in-memory for instant reactivity and ease of setup
let surgeMultiplier = 1.0;
let baseDeliveryFee = 30;
let dispatchConfig = {
  autoDispatch: true,
  maxRadius: 5.0, // km
  maxLoadPerRider: 2,
};

let supportTickets = [
  {
    _id: "TKT-1001",
    customer: { name: "Rohan Kumar", email: "rohan@gmail.com" },
    orderId: "#ORD-2043",
    subject: "Cold food delivered",
    description: "The pizza delivered was completely cold and cheese was hardened. Need a refund.",
    priority: "high",
    status: "open",
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  },
  {
    _id: "TKT-1002",
    customer: { name: "Ananya Sen", email: "ananya@gmail.com" },
    orderId: "#ORD-2044",
    subject: "Rider behavior issue",
    description: "The rider was rude when asking for delivery location details. Extremely unprofessional.",
    priority: "medium",
    status: "open",
    createdAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
  },
  {
    _id: "TKT-1003",
    customer: { name: "Vikram Singh", email: "vikram@gmail.com" },
    orderId: "#ORD-2032",
    subject: "Wrong items delivered",
    description: "Ordered 2 veg burgers but received chicken burgers. I am strictly vegetarian.",
    priority: "critical",
    status: "resolved",
    createdAt: new Date(Date.now() - 3600000 * 12), // 12 hours ago
  }
];

// --- 1. Dashboard Metrics ---
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalRiders = await Rider.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Aggregate GMV
    const paidOrders = await Order.find({ paymentStatus: "paid" });
    const gmv = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const platformCommission = gmv * 0.15; // 15% platform cut

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email phone")
      .populate("restaurant", "name")
      .populate("rider", "user")
      .sort({ createdAt: -1 })
      .limit(10);

    // Top Restaurants based on orders count
    const ordersGroup = await Order.aggregate([
      { $group: { _id: "$restaurant", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topRestaurants = [];
    for (let item of ordersGroup) {
      if (item._id) {
        const rest = await Restaurant.findById(item._id);
        if (rest) {
          topRestaurants.push({
            id: rest._id,
            name: rest.name,
            image: rest.image || "/pizza_slice.png",
            rating: rest.rating || 4.2,
            ordersCount: item.count,
            revenue: item.revenue
          });
        }
      }
    }

    res.json({
      metrics: {
        totalUsers,
        totalRestaurants,
        totalRiders,
        totalOrders,
        gmv,
        platformCommission,
        surgeMultiplier,
        baseDeliveryFee
      },
      recentOrders,
      topRestaurants
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin stats", error: error.message });
  }
};

// --- 2. Restaurant Management ---
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("owner", "name email phone");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error: error.message });
  }
};

exports.updateRestaurantStatus = async (req, res) => {
  const { id } = req.params;
  const { status, isOpen, holidayMode } = req.body;
  try {
    const rest = await Restaurant.findById(id);
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });

    if (status !== undefined) rest.status = status;
    if (isOpen !== undefined) rest.isOpen = isOpen;
    if (holidayMode !== undefined) rest.holidayMode = holidayMode;

    await rest.save();
    res.json({ message: "Restaurant updated successfully", restaurant: rest });
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant", error: error.message });
  }
};

// --- 3. Rider Management ---
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find().populate("user", "name email phone role isBanned");
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching riders", error: error.message });
  }
};

exports.updateRiderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, zone, earnings } = req.body;
  try {
    const rider = await Rider.findById(id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    if (status !== undefined) rider.status = status;
    if (zone !== undefined) rider.zone = zone;
    if (earnings !== undefined) rider.earnings = earnings;

    await rider.save();
    res.json({ message: "Rider profile updated successfully", rider });
  } catch (error) {
    res.status(500).json({ message: "Error updating rider status", error: error.message });
  }
};

// --- 4. User Accounts ---
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

exports.toggleUserBan = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle custom flag isBanned
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Error toggling user ban", error: error.message });
  }
};

// --- 5. Order Dispatch Engine ---
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone isBanned")
      .populate("restaurant", "name location deliveryFee")
      .populate({
        path: "rider",
        populate: { path: "user", select: "name phone" }
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

exports.dispatchOrder = async (req, res) => {
  const { id } = req.params;
  const { riderId, status } = req.body;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (riderId !== undefined) {
      if (riderId === null) {
        order.rider = null;
      } else {
        const rider = await Rider.findById(riderId);
        if (!rider) return res.status(404).json({ message: "Rider not found" });
        order.rider = rider._id;
        // Optionally put rider on delivery
        rider.status = "on_delivery";
        rider.currentOrder = order._id;
        await rider.save();
      }
    }

    if (status !== undefined) {
      order.status = status;
    }

    await order.save();

    // Broadcast update using socket.io if server available
    const io = req.app.get("io");
    if (io) {
      io.to(`order_${order._id}`).emit("orderStatusUpdate", { orderId: order._id, status: order.status, riderLocation: order.riderLocation });
      io.emit("adminOrderUpdate", order);
    }

    res.json({ message: "Order updated & dispatched successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error dispatching order", error: error.message });
  }
};

// --- 6. Pricing & Surge Control ---
exports.getPricingConfig = (req, res) => {
  res.json({
    surgeMultiplier,
    baseDeliveryFee,
    dispatchConfig
  });
};

exports.updatePricingConfig = (req, res) => {
  const { surge, deliveryFee, autoDispatch, maxRadius, maxLoad } = req.body;

  if (surge !== undefined) surgeMultiplier = parseFloat(surge);
  if (deliveryFee !== undefined) baseDeliveryFee = parseFloat(deliveryFee);
  if (autoDispatch !== undefined) dispatchConfig.autoDispatch = !!autoDispatch;
  if (maxRadius !== undefined) dispatchConfig.maxRadius = parseFloat(maxRadius);
  if (maxLoad !== undefined) dispatchConfig.maxLoadPerRider = parseInt(maxLoad);

  // Notify clients of operational configuration change
  const io = req.app.get("io");
  if (io) {
    io.emit("opsConfigChange", { surgeMultiplier, baseDeliveryFee, dispatchConfig });
  }

  res.json({
    message: "Operations pricing config updated successfully",
    config: {
      surgeMultiplier,
      baseDeliveryFee,
      dispatchConfig
    }
  });
};

// --- 7. Support Tickets ---
exports.getTickets = (req, res) => {
  res.json(supportTickets);
};

exports.resolveTicket = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = supportTickets.find(t => t._id === id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  if (status) ticket.status = status;
  res.json({ message: "Ticket status updated", ticket });
};
