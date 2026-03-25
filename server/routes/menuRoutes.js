const express = require("express");
const router = express.Router();
const { addMenuItem, getMenuByRestaurant } = require("../controllers/menuController");

router.post("/", addMenuItem);
router.get("/:id", getMenuByRestaurant);

module.exports = router;