const MenuItem = require("../models/MenuItem");

// Add Menu Item
exports.addMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Menu by Restaurant
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};