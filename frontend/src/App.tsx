import { useState, useEffect, FormEvent } from 'react'
import { Routes, Route, useNavigate, Navigate } from "react-router-dom"
import axios from 'axios'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Account from './components/Account'
import Favorite from './components/Favorite'

// Define types based on backend models
interface SearchCriteria {
  term: string;
  location?: string;
  limit?: number;
  radius?: number;
  price?: string;
  sort_by?: string;
  attributes?: string;
}

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  url: string;
  review_count: number;
  rating: number;
  price?: string;
  display_phone?: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  categories: {
    alias: string;
    title: string;
  }[];
  isFavorite?: boolean; 
  favoriteCount?: number; 
}

interface SearchResponse {
  businesses: Restaurant[];
  total: number;
  region: {
    center: {
      longitude: number;
      latitude: number;
    }
  };
}

function App() {
  // Define initial criteria state as a constant for reuse
  const initialCriteria: SearchCriteria = {
    term: '',
    location: '',
    limit: 20,
    sort_by: 'best_match',
    price: '1,2,3,4'
  };

  // Search criteria state - now using the initialCriteria constant
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);

  // Results state
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false); 

  // Authentication state
  const [activePage, setCurrentView] = useState<string>('/');
  const [isAuthenticated, setLoginStatus] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setConfirmPassword] = useState<string>('');
  
  const api_key_name: string = 'api_key'; 
  const navigate = useNavigate();

  // Add state for favorites
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(false);

  // Authentication helpers
  const checkAuthStatus = () => {
    const storedToken = localStorage.getItem(api_key_name);
    if (storedToken) {
      setLoginStatus(true);
      setUsername(localStorage.getItem("username") || "");
      setEmail(localStorage.getItem("email") || "");
      setPassword(localStorage.getItem("password") || "");
      setConfirmPassword('');
    }
  };

  const saveAuthData = (username: string, email: string, password: string, api_key: string) => {
    localStorage.setItem("username", username);
    localStorage.setItem("email", email)
    localStorage.setItem("password", password);
    localStorage.setItem(api_key_name, api_key);
    setUsername(username);
    setLoginStatus(true);
    setCurrentView('/');
    setError('');
    setCriteria(initialCriteria); 
    navigate('/');
  };

  const clearAuthData = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem(api_key_name);
    setUsername('');
    setEmail('')
    setPassword('');
    setConfirmPassword('');
    setResults([]);
    setFavorites([]);
    setError('');
    setCriteria(initialCriteria); 
    setLoginStatus(false);
    setCurrentView('/');
    navigate('/');
  };

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Missing email');
      return false;
    }
    
    // More comprehensive email validation
    if (!email.includes('@')) {
      setError('Invalid email format');
      return false;
    }
    
    return true;
  };

  const validatePasswords = (checkRepeat: boolean): boolean => {
    if (!password) {
      setError('Missing password');
      setPassword('');
      setConfirmPassword('');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setPassword('');
      setConfirmPassword('');
      return false;
    }
    
    if (checkRepeat) {
      if (!passwordConfirm) {
        setError('Please confirm your password');
        return false;
      }
      
      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        setPassword('');
        setConfirmPassword('');
        return false;
      }
    }
    
    return true;
  };

  // Effects
  useEffect(() => {
    setError('');
    checkAuthStatus();
  }, [activePage]);

  // Load favorites on authentication status change
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Fetch user favorites from the backend
  const fetchFavorites = async () => {
    if (!localStorage.getItem(api_key_name)) return;
    
    // Set loading to true when fetching starts
    setFavoritesLoading(true); 
    try {
      const response = await axios.get('/api/favorites', {
        headers: {
          'Content-Type': 'application/json',
          'apiKey': localStorage.getItem(api_key_name) || '',
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
      // Set loading to false when fetching completes
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
            'apiKey': localStorage.getItem(api_key_name) || '',
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
            'apiKey': localStorage.getItem(api_key_name) || '',
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

  // Authentication handlers
  const handleLogin = async () => {
    if (!validateEmail() || !validatePasswords(false)) return;

    await axios.get('/api/login', {
      headers: {
        email: email,
        password: password,
        'Content-Type': 'application/json',
      }, 
    }).then((response) => {
      saveAuthData(response.data.username, email, password, response.data.api_key);
    }).catch((error) => {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Login failed');
      setPassword('');
    });
  }

  const handleRegister = async () => {
    if (!validateEmail() || !validatePasswords(true)) return;

    await axios.post('/api/register', {}, { 
      headers: {
        'Content-Type': 'application/json',
        email: email,
        password: password
      }
    }).then((response) => {
      saveAuthData(response.data.username, email, password, response.data.api_key);
      setPassword('');
    }).catch((error) => {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to register');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    });
  }

  const handleLogout = () => {
    clearAuthData();
  }

  const handleChangeAccount = async () => {
    if (!validatePasswords(true)) return;
    
    await axios.put('/api/change_password', {}, {
      headers: {
        'Content-Type': 'application/json',
        email: email,
        newPassword: password,
        apiKey: localStorage.getItem(api_key_name),
      }
    }).then(() => {
      localStorage.setItem("password", password);
      setConfirmPassword('');
      setError('Password changed successfully');
    }).catch((error) => {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to change password');
      setPassword(localStorage.getItem("password") || ""); 
      setConfirmPassword('');
    });
  }

  // Navigation handlers
  const handleMenuClick = (targetPage: string) => {
    if (targetPage === 'logout') {
      setCurrentView('/');
      navigate('/');
      return;
    }
    if ((targetPage === 'account' || targetPage === 'favorite') && !isAuthenticated) {
      console.log("GO TO LOGIN");
      setCurrentView('/login');
      navigate('/login');
      return;
    }
    setCurrentView(`/${targetPage}`);
    navigate(`/${targetPage}`);
  };

  const handleHomeClick = () => {
    setCurrentView('/');
    navigate('/');
    document.title = "Restaurant Recommender";
  };

  // Props
  const authProps = {
    email,
    setEmail,
    password,
    setPassword,
    errorMessage: error,
    setCurrentView,
    handleMenuClick,
    handleLogin  
  };

  const registerAccountProps = {
    ...authProps,
    confirmPassword: passwordConfirm,
    setConfirmPassword,
    handleRegister  
  };

  const changeAccountProps = {
    username,
    password,
    setPassword,
    errorMessage: error,
    setCurrentView,
    handleMenuClick,
    confirmPassword: passwordConfirm,
    setConfirmPassword,
    handleChangeAccount  
  }

  const favoriteProps = {
    favorites,
    toggleFavorite,
    error,
    setError,
    isLoading: favoritesLoading 
  }

  // Helper functions for unit conversion
  const metersToKm = (meters: number): number => meters / 1000;
  const kmToMeters = (km: number): number => Math.round(km * 1000);

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
    } catch (err) {
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

  return (
    <div className="app-container">
      {/* Header with search bar - Always render the header-top */}
      <header className="app-header">
        <div className="header-top">
          <h1 className="home" onClick={handleHomeClick}>Restaurant Recommender</h1>
          <div className="nav-buttons">
            {isAuthenticated && (
              <>
                <button onClick={() => handleMenuClick('favorite')}>Favorites</button>  
                <button onClick={() => handleMenuClick('account')}>Account</button>
                <button onClick={(e) => {e.preventDefault(); handleLogout();}}>Log Out</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <button onClick={() => handleMenuClick('login')}>Login</button>
                <button onClick={() => handleMenuClick('register')}>Register</button>
              </>
            )}
          </div>
        </div>
        {/* Only render search form on main route */}
        {activePage === '/' && (
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              name="term"
              value={criteria.term}
              onChange={handleInputChange}
              placeholder="Search restaurants, cuisine types, or dishes..."
              className="search-input"
              required
            />
            <input
              type="text"
              name="location"
              value={criteria.location || ''}
              onChange={handleInputChange}
              placeholder="City, address, or zip code"
              className="location-input"
              required
            />
            <button type="submit" className="search-button">
              {loading ? 'Searching...' : 'Find Restaurants'}
            </button>
          </form>
        )}
      </header>
      
      {/* Main content area with routes */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={
            (() => {
              useEffect(() => { handleHomeClick }, []);
              return (
                <div className="content-container">
                  {/* Left sidebar with filters */}
                  <aside className="filters-sidebar">
                    <h2>Filters</h2>

                    <div className="filter-section">
                      <h3>Sort By</h3>
                      <select 
                        name="sort_by" 
                        value={criteria.sort_by} 
                        onChange={handleInputChange}
                        className="filter-select"
                      >
                        <option value="best_match">Best Match</option>
                        <option value="rating">Rating</option>
                        <option value="review_count">Review Count</option>
                        <option value="distance">Distance</option>
                      </select>
                    </div>
                    
                    <div className="filter-section">
                      <h3>Price</h3>
                      <div className="price-filters">
                        <label>
                          <input 
                            type="checkbox" 
                            name="price"
                            value="1"
                            checked={criteria.price?.includes('1')}
                            onChange={handleInputChange}
                          /> $
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="price"
                            value="2"
                            checked={criteria.price?.includes('2')}
                            onChange={handleInputChange}
                          /> $$
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="price"
                            value="3"
                            checked={criteria.price?.includes('3')}
                            onChange={handleInputChange}
                          /> $$$
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="price"
                            value="4"
                            checked={criteria.price?.includes('4')}
                            onChange={handleInputChange}
                          /> $$$$
                        </label>
                      </div>
                    </div>
                    
                    <div className="filter-section">
                      <h3>Distance (kilometers)</h3>
                      <input
                        type="range"
                        name="radius"
                        min="0.5"
                        max="40"
                        step="0.5"
                        value={criteria.radius ? metersToKm(criteria.radius) : 5}
                        onChange={handleInputChange}
                        className="range-slider"
                      />
                      <div className="range-value">
                        {criteria.radius ? metersToKm(criteria.radius).toFixed(1) : '5.0'} km
                      </div>
                    </div>
                    
                    <div className="filter-section">
                      <h3>Number of Results</h3>
                      <select 
                        name="limit" 
                        value={criteria.limit} 
                        onChange={handleInputChange}
                        className="filter-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    
                    <div className="filter-section">
                      <h3>Features</h3>
                      
                      <div className="attributes-group">
                        <h4>Services</h4>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="reservation"
                            checked={isAttributeSelected('reservation')}
                            onChange={handleInputChange}
                          /> Reservations on Yelp
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="happy_hour"
                            checked={isAttributeSelected('happy_hour')}
                            onChange={handleInputChange}
                          /> Happy Hour
                        </label>
                      </div>
                      
                      <div className="attributes-group">
                        <h4>Ambience</h4>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="ambience_casual"
                            checked={isAttributeSelected('ambience_casual')}
                            onChange={handleInputChange}
                          /> Casual
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="ambience_classy"
                            checked={isAttributeSelected('ambience_classy')}
                            onChange={handleInputChange}
                          /> Classy
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="ambience_upscale"
                            checked={isAttributeSelected('ambience_upscale')}
                            onChange={handleInputChange}
                          /> Upscale
                        </label>
                      </div>
                      
                      <div className="attributes-group">
                        <h4>Noise Level</h4>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="noise_level_quiet"
                            checked={isAttributeSelected('noise_level_quiet')}
                            onChange={handleInputChange}
                          /> Quiet
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="noise_level_average"
                            checked={isAttributeSelected('noise_level_average')}
                            onChange={handleInputChange}
                          /> Average
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="noise_level_loud"
                            checked={isAttributeSelected('noise_level_loud')}
                            onChange={handleInputChange}
                          /> Loud
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="noise_level_very_loud"
                            checked={isAttributeSelected('noise_level_very_loud')}
                            onChange={handleInputChange}
                          /> Very Loud
                        </label>
                      </div>
                      
                      <div className="attributes-group">
                        <h4>Amenities</h4>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="outdoor_seating"
                            checked={isAttributeSelected('outdoor_seating')}
                            onChange={handleInputChange}
                          /> Outdoor Seating
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="parking"
                            checked={isAttributeSelected('parking')}
                            onChange={handleInputChange}
                          /> Parking
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="attribute"
                            value="wifi"
                            checked={isAttributeSelected('wifi')}
                            onChange={handleInputChange}
                          /> WiFi
                        </label>
                      </div>
                      
                    </div>
                    
                  </aside>

                  {/* Main content area for results */}
                  <main className="results-area">
                    {error && <div className="error-message">{error}</div>}
                    
                    {loading ? (
                      <div className="loading">Analyzing restaurant options...</div>
                    ) : results.length > 0 ? (
                      <div className="results-list">
                        <h2>Recommended Restaurants</h2>
                        {results.map(restaurant => (
                          <div key={restaurant.id} className="restaurant-card">
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
                                <div className="favorite-count">
                                  <span className="icon heart-icon">♥</span> 
                                  {(restaurant.favoriteCount || 0) <= 1 
                                    ? `${restaurant.favoriteCount || 0} Partner Loves This` 
                                    : `${restaurant.favoriteCount || 0} Partners Love This`}
                                </div>
                              </div>
                            </div>
                          </div>
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
                </div>
              );
            })()
          } />
          
          <Route path="/login" element={
            <div className="auth-container">
              <Login {...authProps} />
            </div>
          } />
          
          <Route path="/register" element={
            <div className="auth-container">
              <Register {...registerAccountProps} />
            </div>
          } />

          <Route path="/account" element={
            localStorage.getItem(api_key_name) ? (
              <div className="auth-container">
                <Account {...changeAccountProps} />
              </div>
            ) : (
              <Navigate replace to={"/login"} />
            )
          } />
          
          <Route path="/favorite" element={
            localStorage.getItem(api_key_name) ? (
              <Favorite {...favoriteProps} />
            ) : (
              <Navigate replace to={"/login"} />
            )
          } />
          
          <Route path="*" element={
            localStorage.getItem(api_key_name) ? 
            <Navigate to="/" /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </div>
  )
}

export default App
