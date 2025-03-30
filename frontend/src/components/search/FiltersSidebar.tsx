import React from 'react';
import { SearchCriteria } from '../../types';
import { metersToKm } from '../../utils/helpers';

interface FiltersSidebarProps {
  criteria: SearchCriteria;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isAttributeSelected: (attr: string) => boolean;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ 
  criteria, 
  handleInputChange,
  isAttributeSelected
}) => {
  return (
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
  );
};

export default FiltersSidebar;
