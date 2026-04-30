const express = require("express");
const router = express.Router();
const { addRestaurant, getRestaurants, getNearbyRestaurants, getRestaurantById } = require("../controllers/restaurantController");

router.post("/", addRestaurant);
router.get("/", getRestaurants);
router.get("/nearby", getNearbyRestaurants);
router.get("/:id", getRestaurantById);

module.exports = router;