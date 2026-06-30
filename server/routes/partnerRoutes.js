const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  uploadRestaurantImage,
  toggleRestaurantStatus,
  getMyMenu,
  addMyMenuItem,
  updateMyMenuItem,
  deleteMyMenuItem,
  toggleMyMenuItem,
  getMyOrders,
  acceptOrder,
  rejectOrder,
  markFoodReady,
  getEarnings,
  getMyReviews,
} = require("../controllers/partnerController");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, "restaurant-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// All partner routes require authentication
router.use(protect);

// ─── Restaurant ───────────────────────────────
router.get("/restaurant", getMyRestaurant);
router.post("/restaurant", createMyRestaurant);
router.put("/restaurant", updateMyRestaurant);
router.post("/restaurant/image", upload.single("image"), uploadRestaurantImage);
router.patch("/restaurant/toggle", toggleRestaurantStatus);

// ─── Menu ─────────────────────────────────────
router.get("/menu", getMyMenu);
router.post("/menu", addMyMenuItem);
router.put("/menu/:itemId", updateMyMenuItem);
router.delete("/menu/:itemId", deleteMyMenuItem);
router.patch("/menu/:itemId/toggle", toggleMyMenuItem);

// ─── Orders ───────────────────────────────────
router.get("/orders", getMyOrders);
router.patch("/orders/:orderId/accept", acceptOrder);
router.patch("/orders/:orderId/reject", rejectOrder);
router.patch("/orders/:orderId/ready", markFoodReady);

// ─── Analytics ────────────────────────────────
router.get("/earnings", getEarnings);
router.get("/reviews", getMyReviews);

module.exports = router;
