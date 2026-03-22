const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ADD ROUTES HERE
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("InstaMeal API is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
