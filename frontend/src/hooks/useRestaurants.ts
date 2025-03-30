import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SearchCriteria, Restaurant, SearchResponse } from '../types';
import { kmToMeters } from '../utils/helpers';
import { API_KEY_NAME } from './useAuth';

export interface UseRestaurantsReturn {
  criteria: SearchCriteria;
  results: Restaurant[];
  favorites: Restaurant[];
  loading: boolean;
  favoritesLoading: boolean;
  error: string;
  hasSearched: boolean;
  setCriteria: (criteria: SearchCriteria) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isAttributeSelected: (attr: string) => boolean;
  handleSearch: (e: FormEvent) => Promise<void>;
  toggleFavorite: (restaurant: Restaurant) => Promise<void>;
  toggleComments: (restaurantId: string) => void;
  fetchFavorites: () => Promise<void>;
  setError: (error: string) => void;
}

// Initial search criteria
const initialCriteria: SearchCriteria = {
  term: '',
  location: '',
  limit: 20,
  sort_by: 'best_match',
  price: '1,2,3,4'
};

export function useRestaurants(isAuthenticated: boolean): UseRestaurantsReturn {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const [results, setResults] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const navigate = useNavigate();

  // Reset search and results when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setCriteria(initialCriteria);
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Load favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  // Fetch user favorites from the backend
  const fetchFavorites = async () => {
    if (!localStorage.getItem(API_KEY_NAME)) return;
    
    setFavoritesLoading(true); 
    try {
      const response = await axios.get('/api/favorites', {
        headers: {
          'Content-Type': 'application/json',
          'apiKey': localStorage.getItem(API_KEY_NAME) || '',
        }
      });
      setFavorites(response.data.favorites || []);
      
      // Update isFavorite flag for any currently displayed results
      if (results.length > 0) {
        const favIds = response.data.favorites.map((fav: Restaurant) => fav.id);
        
        // Also get favorite counts when updating favorites
        const restaurantIds = results.map(restaurant => restaurant.id);
        try {
          const countsResponse = await axios.post('/api/favorites/counts', restaurantIds);
          const counts = countsResponse.data.counts || {};
          
          // Update both isFavorite status and favorite counts
          setResults(results.map(restaurant => ({
            ...restaurant,
            isFavorite: favIds.includes(restaurant.id),
            favoriteCount: counts[restaurant.id] || 0
          })));
        } catch (err) {
          console.error('Error fetching favorite counts:', err);
          // Just update favorite status if counts fail
          setResults(results.map(restaurant => ({
            ...restaurant,
            isFavorite: favIds.includes(restaurant.id)
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setFavoritesLoading(false); 
    }
  };

  // Toggle favorite status for a restaurant
  const toggleFavorite = async (restaurant: Restaurant) => {
    if (!isAuthenticated) {
      setError("Please log in to save favorites");
      navigate('/login');
      return;
    }
    
    try {
      if (restaurant.isFavorite) {
        // Remove from favorites
        await axios.delete(`/api/favorites/${restaurant.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': localStorage.getItem(API_KEY_NAME) || '',
          }
        });
        
        // Update local state
        setFavorites(favorites.filter(fav => fav.id !== restaurant.id));
        
        // Update results list - decrement favorite count
        setResults(results.map(r => 
          r.id === restaurant.id ? { 
            ...r, 
            isFavorite: false,
            favoriteCount: (r.favoriteCount || 1) - 1 // Decrement count
          } : r
        ));
      } else {
        // Add to favorites
        await axios.post('/api/favorites', restaurant, {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': localStorage.getItem(API_KEY_NAME) || '',
          }
        });
        
        // Update local state with favorite flag
        setFavorites([...favorites, { ...restaurant, isFavorite: true }]);
        
        // Update results list - increment favorite count
        setResults(results.map(r => 
          r.id === restaurant.id ? { 
            ...r, 
            isFavorite: true,
            favoriteCount: (r.favoriteCount || 0) + 1 // Increment count
          } : r
        ));
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      setError('Failed to update favorites');
    }
  };

  // Toggle comments visibility
  const toggleComments = (restaurantId: string) => {
    setResults(prevResults => 
      prevResults.map(restaurant => 
        restaurant.id === restaurantId 
          ? { ...restaurant, showComments: !restaurant.showComments }
          : restaurant
      )
    );
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkboxes for price filters
    if (type === 'checkbox' && name === 'price') {
      const isChecked = (e.target as HTMLInputElement).checked;
      const priceValue = (e.target as HTMLInputElement).value;
      
      // Filter out empty strings when splitting
      let prices = criteria.price?.split(',').filter(p => p.trim() !== '') || [];
      
      if (isChecked && !prices.includes(priceValue)) {
        // Add price only if it doesn't already exist
        prices.push(priceValue);
      } else if (!isChecked) {
        // Remove price if unchecked
        prices = prices.filter(p => p !== priceValue);
      }
      
      setCriteria({
        ...criteria,
        price: prices.join(',')
      });
    } else if (type === 'checkbox' && name === 'attribute') {
      const isChecked = (e.target as HTMLInputElement).checked;
      const attributeValue = (e.target as HTMLInputElement).value;
      
      // Get current attributes, ensure it's an array
      let attributes = criteria.attributes?.split(',').filter(a => a.trim() !== '') || [];
      
      if (isChecked && !attributes.includes(attributeValue)) {
        // Add attribute if checked and not already included
        attributes.push(attributeValue);
      } else if (!isChecked) {
        // Remove attribute if unchecked
        attributes = attributes.filter(a => a !== attributeValue);
      }
      
      setCriteria({
        ...criteria,
        attributes: attributes.join(',')
      });
    } else if (name === 'radius') {
      // Convert km to meters for the API
      const radiusInKm = parseFloat(value);
      setCriteria({
        ...criteria,
        radius: kmToMeters(radiusInKm)
      });
    } else if (name === 'limit') {
      // Convert string to number for the limit parameter
      setCriteria({
        ...criteria,
        limit: parseInt(value, 10)
      });
    } else {
      setCriteria({
        ...criteria,
        [name]: value
      });
    }
  };

  // Helper function to check if an attribute is selected
  const isAttributeSelected = (attr: string): boolean => {
    return criteria.attributes?.split(',').includes(attr) || false;
  };

  // Handle search submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check that both term and location are provided
    if (!criteria.term || !criteria.location) {
      setError("Both a search term and location are required");
      return;
    }
    
    setLoading(true);
    setError('');
    setHasSearched(true); 

    try {
      const response = await axios.post<SearchResponse>('/api/search', criteria);
      
      // Mark favorites in the results
      const favIds = favorites.map(fav => fav.id);
      const markedResults = response.data.businesses.map(business => ({
        ...business,
        isFavorite: favIds.includes(business.id)
      }));
      
      setResults(markedResults);
      
      // Fetch favorite counts for the results
      if (markedResults.length > 0) {
        const restaurantIds = markedResults.map(restaurant => restaurant.id);
        try {
          const countsResponse = await axios.post('/api/favorites/counts', restaurantIds);
          const counts = countsResponse.data.counts || {};
          
          // Update results with favorite counts
          setResults(prevResults => 
            prevResults.map(restaurant => ({
              ...restaurant,
              favoriteCount: counts[restaurant.id] || 0
            }))
          );
        } catch (countErr) {
          console.error('Error fetching favorite counts:', countErr);
        }
      }
    } catch (err: any) {
      console.error('Error fetching results:', err);
      // Handle axios errors specifically
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch results');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    criteria,
    results,
    favorites,
    loading,
    favoritesLoading,
    error,
    hasSearched,
    setCriteria,
    handleInputChange,
    isAttributeSelected,
    handleSearch,
    toggleFavorite,
    toggleComments,
    fetchFavorites,
    setError
  };
}
