import { useEffect, useState } from "react";
import API from "../services/api";
import RestaurantCard from "../components/RestaurantCard";

function Home() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data } = await API.get("/restaurants");
      setRestaurants(data);
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1>InstaMeal 🍔</h1>

      <div style={styles.container}>
        {restaurants.map((res) => (
          <RestaurantCard key={res._id} restaurant={res} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
};

export default Home;