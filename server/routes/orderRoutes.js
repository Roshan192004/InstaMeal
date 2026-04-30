const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  rateOrder,
  updateRiderLocation,
} = require("../controllers/orderController");

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/rate", protect, rateOrder);
router.put("/:id/rider-location", updateRiderLocation); // called by rider/admin

module.exports = router;