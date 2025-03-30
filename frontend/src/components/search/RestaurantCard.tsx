import React from 'react';
import { Restaurant } from '../../types';
import { formatFavoriteCount } from '../../utils/helpers';
import Comments from '../Comments';

interface RestaurantCardProps {
  restaurant: Restaurant;
  toggleFavorite: (restaurant: Restaurant) => void;
  toggleComments: (restaurantId: string) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  toggleFavorite,
  toggleComments,
  isAuthenticated,
  onLogin
}) => {
  return (
    <div className="restaurant-card">
      <button 
        className={`favorite-button ${restaurant.isFavorite ? 'is-favorite' : ''}`}
        onClick={() => toggleFavorite(restaurant)}
        aria-label={restaurant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {restaurant.isFavorite ? '♥' : '♡'}
      </button>
      <div className="restaurant-image">
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name} />
        ) : (
          <div className="no-image">No Image Available</div>
        )}
      </div>
      <div className="restaurant-info">
        <h3>
          <a href={restaurant.url} target="_blank" rel="noopener noreferrer">
            {restaurant.name}
          </a>
        </h3>
        <div className="restaurant-meta">
          <span className="rating">★ {restaurant.rating}</span>
          <span className="review-count">({restaurant.review_count} reviews)</span>
          {restaurant.price && <span className="price">{restaurant.price}</span>}
        </div>
        <div className="restaurant-data">
          <div className="restaurant-categories">
            <span className="icon">🍽️</span> {restaurant.categories.map(cat => cat.title).join(', ')}
          </div>
          <div className="restaurant-address">
            <span className="icon">📍</span> {restaurant.location.address1}, {restaurant.location.city}
          </div>
          {restaurant.display_phone && (
            <div className="restaurant-phone">
              <span className="icon">📞</span> {restaurant.display_phone}
            </div>
          )}
          <div className="restaurant-interactions">
            <div className="favorite-count">
              <span className="icon heart-icon">♥</span> 
              {formatFavoriteCount(restaurant.favoriteCount || 0)}
            </div>
            <button 
              className={`comments-toggle ${restaurant.showComments ? 'active' : ''}`}
              onClick={() => toggleComments(restaurant.id)}
            >
              <span className="icon comment-icon">💬</span>
            </button>
          </div>
        </div>
        
        {/* Expandable comments section */}
        {restaurant.showComments && (
          <div className="restaurant-comments">
            <Comments 
              restaurantId={restaurant.id} 
              isAuthenticated={isAuthenticated}
              onLogin={onLogin}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
