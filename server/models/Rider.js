const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["offline", "online", "on_delivery"],
    default: "offline",
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
  },
  earnings: {
    type: Number,
    default: 0,
  },
  aadharNumber: { type: String, default: "" },
  vehicleRc: { type: String, default: "" },
  licenseNumber: { type: String, default: "" },
  bankDetails: {
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
  },
  zone: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Rider", riderSchema);
