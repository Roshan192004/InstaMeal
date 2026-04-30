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

// Get Menu by Restaurant — supports both ?restaurant=ID and /:id
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.query.restaurant;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurant ID required" });
    }
    const items = await MenuItem.find({ restaurant: restaurantId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle availability (for restaurant owner / admin)
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};