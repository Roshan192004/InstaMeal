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
    required: false,
  },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  totalPrice: Number,
  deliveryFee: { type: Number, default: 30 },
  discount: { type: Number, default: 0 },
  coupon: { type: String, default: "" },
  paymentId: { type: String, default: "" },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  riderLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  rating: {
    food: { type: Number, default: 0 },
    rider: { type: Number, default: 0 },
    restaurant: { type: Number, default: 0 },
    isRated: { type: Boolean, default: false },
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: false,
  },
  deliveryOtp: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["confirmed", "preparing", "ready_for_pickup", "picked_up", "arriving", "delivered", "cancelled"],
    default: "confirmed",
  },
  prepTime: { type: Number, default: 20 },        // minutes set by restaurant on accept
  rejectionReason: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);