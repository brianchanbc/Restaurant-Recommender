import React from 'react';
import { Restaurant } from '../../types';
import RestaurantCard from './RestaurantCard';

interface ResultsListProps {
  results: Restaurant[];
  loading: boolean;
  error: string;
  hasSearched: boolean;
  toggleFavorite: (restaurant: Restaurant) => void;
  toggleComments: (restaurantId: string) => void;
  isAuthenticated: boolean;
  navigateToLogin: () => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  results,
  loading,
  error,
  hasSearched,
  toggleFavorite,
  toggleComments,
  isAuthenticated,
  navigateToLogin
}) => {
  return (
    <main className="results-area">
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Analyzing restaurant options...</div>
      ) : results.length > 0 ? (
        <div className="results-list">
          <h2>Recommended Restaurants</h2>
          {results.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              toggleFavorite={toggleFavorite}
              toggleComments={toggleComments}
              isAuthenticated={isAuthenticated}
              onLogin={navigateToLogin}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          {hasSearched 
            ? 'No restaurants match your criteria. Try adjusting your search parameters.' 
            : 'Enter a search term and location to find recommended restaurants.'}
        </div>
      )}
    </main>
  );
};

export default ResultsList;
