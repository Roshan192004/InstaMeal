const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: { type: String, default: "" },
  price: {
    type: Number,
    required: true,
  },
  category: String,
  image: String,
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);