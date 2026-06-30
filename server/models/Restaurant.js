const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: String,
  rating: { type: Number, default: 4.0 },
  deliveryTime: { type: String, default: "30-40 min" },
  cuisine: String,
  categories: [String],        // e.g. ["Pizza", "Pasta", "Salads"]
  deliveryFee: { type: Number, default: 30 },
  minimumOrder: { type: Number, default: 100 },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  isOpen: { type: Boolean, default: true },
  holidayMode: { type: Boolean, default: false },
  openingHours: {
    open: { type: String, default: "09:00" },
    close: { type: String, default: "22:00" },
  },
  offers: [
    {
      title: String,
      description: String,
      type: { type: String, enum: ["discount", "bogo", "free_delivery", "flat_off"], default: "discount" },
      value: { type: Number, default: 0 },        // e.g. 20 (for 20% off) or 50 (flat ₹50 off)
      minOrder: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    }
  ],
  prepTime: { type: Number, default: 20 },         // default prep time in minutes
  address: { type: String, default: "" },          // Exact shop location text
  // Geolocation for nearby query
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      default: [0, 0],
    },
  },
}, { timestamps: true });

// 2dsphere index for geo queries
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);