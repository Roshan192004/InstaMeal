const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: String,
  rating: Number,
  deliveryTime: String,
  cuisine: String,
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);