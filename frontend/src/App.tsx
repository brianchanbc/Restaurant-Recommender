import { useState, FormEvent } from 'react'
import axios from 'axios'
import './App.css'

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
  // Search criteria state
  const [criteria, setCriteria] = useState<SearchCriteria>({
    term: '',
    location: '',
    limit: 20,
    sort_by: 'best_match',
    price: '1,2,3,4'
  });

  // Results state
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); 

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
    setError(null);
    setHasSearched(true); 

    try {
      const response = await axios.post<SearchResponse>('/api/search', criteria);
      setResults(response.data.businesses);
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
      {/* Header with search bar */}
      <header className="app-header">
        <h1>Restaurant Recommender</h1>
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
      </header>

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
                    <div className="restaurant-categories">
                      <strong>Cuisine:</strong> {restaurant.categories.map(cat => cat.title).join(', ')}
                    </div>
                    <div className="restaurant-address">
                      <strong>Location:</strong> {restaurant.location.address1}, {restaurant.location.city}
                    </div>
                    {restaurant.display_phone && (
                      <div className="restaurant-phone">
                        <strong>Phone:</strong> {restaurant.display_phone}
                      </div>
                    )}
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
    </div>
  )
}

export default App
