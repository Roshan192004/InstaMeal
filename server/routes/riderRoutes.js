const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");
const { verifyToken } = require("../controllers/authController");

// Require auth for all rider routes
router.use(verifyToken);

router.post("/register", riderController.registerRider);
router.get("/profile", riderController.getRiderProfile);
router.post("/status", riderController.toggleStatus);
router.get("/order", riderController.getAssignedOrder);
router.post("/accept-order", riderController.acceptOrder);
router.post("/location", riderController.updateLocation);
router.post("/order-status", riderController.updateOrderStatus);

module.exports = router;
