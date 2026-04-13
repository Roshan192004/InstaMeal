import { Link } from "react-router-dom";
import "./RestaurantCard.css";

function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id || 1}`} className="restaurant-card-link">
      <div className="restaurant-card">
        <div className="card-image-container">
          <img src={restaurant.image} alt={restaurant.name} className="card-image" />
          {restaurant.offer && (
            <div className="card-offer">
              {restaurant.offer}
            </div>
          )}
        </div>

        <div className="card-content">
          <div className="card-header">
            <h3 className="card-title">{restaurant.name}</h3>
            <div className="card-rating">
              <span className="star">★</span>
              <span>{restaurant.rating}</span>
            </div>
          </div>
          
          <div className="card-details">
            <div className="detail-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{restaurant.deliveryTime} mins</span>
            </div>
          </div>
          
          <div className="card-location">
            {restaurant.location} {restaurant.cuisine ? `• ${restaurant.cuisine}` : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;