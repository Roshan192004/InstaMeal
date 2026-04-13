const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  totalPrice: Number,
  status: {
    type: String,
    enum: ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);