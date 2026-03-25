const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    default: "Preparing",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);