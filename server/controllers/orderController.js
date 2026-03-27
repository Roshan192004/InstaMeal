const Order = require("../models/Order");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
    });

    // Emit initial status
    req.app.get("io").emit("orderStatus", {
      orderId: order._id,
      status: "Preparing",
    });
    //  Out for Delivery
     setTimeout(() => {
      req.app.get("io").emit("orderStatus", {
        orderId: order._id,
        status: "Out for Delivery",
      });
    }, 5000);

    // Delivered
    setTimeout(() => {
      req.app.get("io").emit("orderStatus", {
        orderId: order._id,
        status: "Delivered",
      });
    }, 10000);
// send response
    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};