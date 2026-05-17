const Rider = require("../models/Rider");
const Order = require("../models/Order");
const User = require("../models/User");

// Register a rider
exports.registerRider = async (req, res) => {
  try {
    const { aadharNumber, vehicleRc, licenseNumber, bankDetails, zone } = req.body;
    
    // Check if rider already exists
    let rider = await Rider.findOne({ user: req.user._id });
    if (rider) {
      return res.status(400).json({ message: "Rider profile already exists" });
    }

    rider = new Rider({
      user: req.user._id,
      aadharNumber,
      vehicleRc,
      licenseNumber,
      bankDetails,
      zone
    });

    await rider.save();
    
    // Update user role to rider
    await User.findByIdAndUpdate(req.user._id, { role: "rider" });

    res.status(201).json({ message: "Rider registered successfully", rider });
  } catch (error) {
    console.error("Error registering rider:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get rider profile
exports.getRiderProfile = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id }).populate("user", "name phone email");
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }
    res.status(200).json(rider);
  } catch (error) {
    console.error("Error fetching rider profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle online/offline status
exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'online' or 'offline'
    const rider = await Rider.findOne({ user: req.user._id });
    
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    if (rider.status === "on_delivery" && status === "offline") {
      return res.status(400).json({ message: "Cannot go offline while on delivery" });
    }

    rider.status = status;
    await rider.save();

    res.status(200).json({ message: `Rider is now ${status}`, rider });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get active or assigned order
exports.getAssignedOrder = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Find any order assigned to this rider that is not delivered or cancelled
    const order = await Order.findOne({
      rider: rider._id,
      status: { $in: ["ready_for_pickup", "picked_up", "arriving"] }
    }).populate("restaurant", "name address coordinates phone").populate("user", "name phone");

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error getting assigned order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept order
exports.acceptOrder = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    if (rider.status !== "online") {
      return res.status(400).json({ message: "Must be online to accept orders" });
    }

    // Find an order that needs a rider (e.g. ready_for_pickup and no rider assigned)
    const order = await Order.findOne({
      status: "ready_for_pickup",
      rider: { $exists: false }
    }).populate("restaurant", "name address coordinates phone").populate("user", "name phone");

    if (!order) {
      return res.status(404).json({ message: "No available orders right now" });
    }

    // Assign to rider
    order.rider = rider._id;
    await order.save();

    rider.currentOrder = order._id;
    rider.status = "on_delivery";
    await rider.save();

    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const rider = await Rider.findOneAndUpdate(
      { user: req.user._id },
      { "location.lat": lat, "location.lng": lng },
      { new: true }
    );
    
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // If on delivery, we could emit socket events to the user here
    // const io = req.app.get("io");
    // if (rider.currentOrder) {
    //   io.to(`order_${rider.currentOrder}`).emit("riderLocationUpdate", { lat, lng });
    // }

    res.status(200).json({ message: "Location updated", location: rider.location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (Pick up, delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryOtp } = req.body;
    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    if (status === "delivered") {
      if (order.deliveryOtp && order.deliveryOtp !== deliveryOtp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      rider.status = "online";
      rider.currentOrder = null;
      rider.earnings += order.deliveryFee || 30; // Add delivery fee to earnings
      await rider.save();
    } else if (status === "picked_up") {
      rider.status = "on_delivery";
      rider.currentOrder = order._id;
      await rider.save();
    }

    order.status = status;
    await order.save();

    const io = req.app.get("io");
    io.to(`order_${order._id}`).emit("orderStatusUpdate", { status });

    res.status(200).json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
