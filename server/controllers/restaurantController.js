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

// Get All Restaurants (with search, cuisine, rating, sort)
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, sort } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: "i" };
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    let restaurants = Restaurant.find(query);

    if (sort === "rating") {
      restaurants = restaurants.sort({ rating: -1 });
    } else if (sort === "deliveryTime") {
      restaurants = restaurants.sort({ deliveryTime: 1 });
    }

    const result = await restaurants;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Nearby Restaurants (geolocation)
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, cuisine } = req.query; // radius in meters, default 10km

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    let query = {
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: Number(radius),
        },
      },
    };

    if (cuisine && cuisine !== "All") {
      query.cuisine = { $regex: cuisine, $options: "i" };
    }

    const restaurants = await Restaurant.find(query).limit(20);
    
    // Fetch restaurants with default [0, 0] coordinates to display in development/testing
    const defaultQuery = { "location.coordinates": [0, 0] };
    if (cuisine && cuisine !== "All") {
      defaultQuery.cuisine = { $regex: cuisine, $options: "i" };
    }
    const defaultRestaurants = await Restaurant.find(defaultQuery).limit(10);
    
    // Combine lists without duplicates
    const combined = [...restaurants];
    for (const r of defaultRestaurants) {
      if (!combined.some(existing => existing._id.toString() === r._id.toString())) {
        combined.push(r);
      }
    }

    res.json(combined);
  } catch (error) {
    // Fallback: if no geo-indexed docs found, return all restaurants
    console.error("Geo query error, falling back:", error.message);
    try {
      const fallbackQuery = {};
      if (cuisine && cuisine !== "All") {
        fallbackQuery.cuisine = { $regex: cuisine, $options: "i" };
      }
      const fallback = await Restaurant.find(fallbackQuery).limit(20);
      res.json(fallback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};