const express = require("express");
const router = express.Router();
const { addRestaurant, getRestaurants } = require("../controllers/restaurantController");

router.post("/", addRestaurant);
router.get("/", getRestaurants);

module.exports = router;