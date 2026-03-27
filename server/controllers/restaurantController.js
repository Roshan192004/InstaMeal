const Restaurant = require("../models/Restaurant");

// Add Restaurant
exports.addRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, sort } = req.query;

    let query = {};

    // 🔍 Search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 🍽️ Filter by cuisine
    if (cuisine) {
      query.cuisine = cuisine;
    }

    // ⭐ Filter by rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    let restaurants = Restaurant.find(query);

    // 📊 Sorting
    if (sort === "rating") {
      restaurants = restaurants.sort({ rating: -1 });
    }

    if (sort === "deliveryTime") {
      restaurants = restaurants.sort({ deliveryTime: 1 });
    }

    const result = await restaurants;

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};