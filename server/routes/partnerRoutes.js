const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
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

// All partner routes require authentication
router.use(protect);

// ─── Restaurant ───────────────────────────────
router.get("/restaurant", getMyRestaurant);
router.post("/restaurant", createMyRestaurant);
router.put("/restaurant", updateMyRestaurant);
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
