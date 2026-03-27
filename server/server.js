// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

//  DB Connection
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//  ==ROUTES ==

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

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

// Test Route
app.get("/", (req, res) => {
  res.send("InstaMeal API is running 🚀");
});

const PORT = process.env.PORT || 5000;

//  SOCKET.IO SETUP
//  Import http and socket.io
const http = require("http");
const { Server } = require("socket.io");

// Create server using http 
const server = http.createServer(app);

//  Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (for development)
  },
});

app.set("io", io);
//  Socket connection logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //  listen custom event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//  SERVER START 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});