import { useState, useEffect } from 'react';
import axios from 'axios';
import Comments from './Comments';
import { Restaurant } from '../types';
import { checkAuthStatus, formatFavoriteCount } from '../utils/helpers';

interface FavoriteProps {
  favorites: Restaurant[];
  toggleFavorite: (restaurant: Restaurant) => void;
  error: string;
  isLoading?: boolean; 
}

const Favorite = ({ favorites, toggleFavorite, error, isLoading = false }: FavoriteProps) => {
  const [favoriteCounts, setFavoriteCounts] = useState<{[id: string]: number}>({});
  const [favoritesWithComments, setFavoritesWithComments] = useState<Restaurant[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on component mount
  useEffect(() => {
    setIsAuthenticated(checkAuthStatus());
  }, []);
  
  // Initialize favorites with comments state
  useEffect(() => {
    setFavoritesWithComments(favorites.map(restaurant => ({ 
      ...restaurant, 
      showComments: false 
    })));
  }, [favorites]);
  
  // Fetch favorite counts when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      const fetchFavoriteCounts = async () => {
        try {
          const restaurantIds = favorites.map(restaurant => restaurant.id);
          const response = await axios.post('/api/favorites/counts', restaurantIds);
          setFavoriteCounts(response.data.counts || {});
        } catch (err) {
          console.error('Error fetching favorite counts:', err);
        }
      };
      
      fetchFavoriteCounts();
    }
  }, [favorites]);

  // Toggle comments visibility
  const toggleComments = (restaurantId: string) => {
    setFavoritesWithComments(prevFavorites => 
      prevFavorites.map(restaurant => 
        restaurant.id === restaurantId 
          ? { ...restaurant, showComments: !restaurant.showComments }
          : restaurant
      )
    );
  };

  // Navigate to login when needed for comments
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="favorite-container">
        <div className="favorite-header">
          <h2>Your Favorites</h2>
        </div>
        <div className="loading-favorites">
          <div className="loading-spinner"></div>
          <p>Loading your favorite restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorite-container">
        <div className="favorite-header">
          <h2>Your Favorites</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!favoritesWithComments || favoritesWithComments.length === 0) {
    return (
      <div className="favorite-container">
        <div className="favorite-header">
          <h2>Your Favorites</h2>
          <p className="favorite-subtitle">Restaurants you've saved will appear here</p>
        </div>
        <div className="empty-favorites">
          <div className="empty-favorites-icon">♥</div>
          <h3>No favorites yet</h3>
          <p>Search for restaurants and click the heart to add them to your favorites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>Your Favorite Restaurants</h2>
        <p className="favorite-subtitle">You have {favoritesWithComments.length} favorite {favoritesWithComments.length === 1 ? 'restaurant' : 'restaurants'}</p>
      </div>
      
      <div className="favorites-grid">
        {favoritesWithComments.map(restaurant => (
          <div key={restaurant.id} className="restaurant-card grid-card">
            <button 
              className="favorite-button is-favorite"
              onClick={() => toggleFavorite(restaurant)}
              aria-label="Remove from favorites"
            >
              ♥
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
                    {formatFavoriteCount(favoriteCounts[restaurant.id] || restaurant.favoriteCount || 0)}
                  </div>
                  <button 
                    className={`comments-toggle ${restaurant.showComments ? 'active' : ''}`}
                    onClick={() => toggleComments(restaurant.id)}
                  >
                    <span className="icon comment-icon">💬</span>
                  </button>
                </div>
                
                {/* Expandable comments section */}
                {restaurant.showComments && (
                  <div className="restaurant-comments">
                    <Comments 
                      restaurantId={restaurant.id} 
                      isAuthenticated={isAuthenticated}
                      onLogin={navigateToLogin}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorite;