const express = require("express");
const router = express.Router();
const { addMenuItem, getMenuByRestaurant, toggleAvailability } = require("../controllers/menuController");

// GET /api/menu?restaurant=ID  OR  GET /api/menu/:id
router.post("/", addMenuItem);
router.get("/", getMenuByRestaurant);           // ?restaurant=ID
router.get("/:id", getMenuByRestaurant);        // /:restaurantId
router.patch("/:id/toggle", toggleAvailability);

module.exports = router;