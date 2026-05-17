const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,   // allows null/undefined (phone-only users won't have email)
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["customer", "store_owner", "admin", "rider"],
    default: "customer",
  },
  savedAddresses: [
    {
      label: { type: String, default: "Home" },
      street: String,
      city: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);