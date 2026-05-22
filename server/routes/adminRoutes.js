const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  getAdminStats,
  getRestaurants,
  updateRestaurantStatus,
  getRiders,
  updateRiderStatus,
  getUsers,
  toggleUserBan,
  getOrders,
  dispatchOrder,
  getPricingConfig,
  updatePricingConfig,
  getTickets,
  resolveTicket
} = require("../controllers/adminController");

// Restrict all routes in this router to authenticated Admins
router.use(protect);
router.use(admin);

router.get("/stats", getAdminStats);

router.get("/restaurants", getRestaurants);
router.put("/restaurants/:id/status", updateRestaurantStatus);

router.get("/riders", getRiders);
router.put("/riders/:id/status", updateRiderStatus);

router.get("/users", getUsers);
router.put("/users/:id/ban", toggleUserBan);

router.get("/orders", getOrders);
router.put("/orders/:id/dispatch", dispatchOrder);

router.get("/pricing", getPricingConfig);
router.put("/pricing", updatePricingConfig);

router.get("/tickets", getTickets);
router.put("/tickets/:id/resolve", resolveTicket);

module.exports = router;
