import { Link } from "react-router-dom";

function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id}`}>
      <div style={styles.card}>
        <img src={restaurant.image} alt="" style={styles.image} />

        <h3>{restaurant.name}</h3>
        <p>{restaurant.cuisine}</p>

        <div style={styles.info}>
          <span>⭐ {restaurant.rating}</span>
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    width: "250px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    margin: "10px",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
  },
};

export default RestaurantCard;