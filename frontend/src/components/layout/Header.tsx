import React, { FormEvent } from 'react';
import { SearchCriteria } from '../../types';

interface HeaderProps {
  activePage: string;
  isAuthenticated: boolean;
  handleMenuClick: (targetPage: string) => void;
  handleHomeClick: () => void;
  handleSearch: (e: FormEvent) => Promise<void>;
  criteria: SearchCriteria;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  loading: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activePage,
  isAuthenticated,
  handleMenuClick,
  handleHomeClick,
  handleSearch,
  criteria,
  handleInputChange,
  loading,
  handleLogout
}) => {
  return (
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
  );
};

export default Header;
