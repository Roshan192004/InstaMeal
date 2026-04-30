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