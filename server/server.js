// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//  DB Connection
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ==ROUTES ==

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Firebase Phone Auth
const firebaseAuthRoutes = require("./routes/firebaseAuthRoutes");
app.use("/api/auth", firebaseAuthRoutes);

// User Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Restaurant & Menu Routes
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);

// Order Routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// Payment Routes
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Coupon Routes
const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupon", couponRoutes);

// Partner (Merchant) Routes
const partnerRoutes = require("./routes/partnerRoutes");
app.use("/api/partner", partnerRoutes);

// Rider Routes
const riderRoutes = require("./routes/riderRoutes");
app.use("/api/rider", riderRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("InstaMeal API is running 🚀");
});

const PORT = process.env.PORT || 5000;

//  SOCKET.IO SETUP
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Rider joins order room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room: order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//  SERVER START
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});