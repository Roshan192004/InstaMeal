const Order = require("../models/Order");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalPrice, deliveryFee, discount, coupon, paymentId, address, restaurantId } = req.body;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId || undefined,
      items,
      totalPrice,
      deliveryFee: deliveryFee || 30,
      discount: discount || 0,
      coupon: coupon || "",
      paymentId: paymentId || "",
      paymentStatus: paymentId ? "paid" : "pending",
      address: address || {},
      status: "confirmed",
    });

    const io = req.app.get("io");

    // Emit status progression
    io.emit("orderStatus", { orderId: order._id, status: "confirmed" });

    setTimeout(() => {
      io.emit("orderStatus", { orderId: order._id.toString(), status: "preparing" });
    }, 5000);

    setTimeout(() => {
      io.emit("orderStatus", { orderId: order._id.toString(), status: "picked_up" });
    }, 15000);

    setTimeout(() => {
      io.emit("orderStatus", { orderId: order._id.toString(), status: "arriving" });
      // Simulate rider location
      io.emit("riderLocation", {
        orderId: order._id.toString(),
        lat: (address?.coordinates?.lat || 28.6139) + 0.002,
        lng: (address?.coordinates?.lng || 77.2090) + 0.002,
      });
    }, 25000);

    setTimeout(() => {
      io.emit("orderStatus", { orderId: order._id.toString(), status: "delivered" });
    }, 40000);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("restaurant", "name image cuisine")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name image cuisine deliveryFee");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RATE ORDER
exports.rateOrder = async (req, res) => {
  try {
    const { food, rider, restaurant } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    order.rating = { food, rider, restaurant, isRated: true };
    await order.save();
    res.json({ message: "Rating saved", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE RIDER LOCATION (called by rider app or simulated)
exports.updateRiderLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { riderLocation: { lat, lng } },
      { new: true }
    );
    req.app.get("io").emit("riderLocation", {
      orderId: req.params.id,
      lat,
      lng,
    });
    res.json({ message: "Location updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};