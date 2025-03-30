import React, { useEffect } from 'react';
import { HomeContentProps } from '../../types';
import FiltersSidebar from './FiltersSidebar';
import ResultsList from './ResultsList';

const HomeContent: React.FC<HomeContentProps> = ({
  criteria,
  results,
  loading,
  error,
  hasSearched,
  handleInputChange,
  isAttributeSelected,
  toggleFavorite,
  toggleComments,
  isAuthenticated,
  navigateToLogin,
  handleHomeClick
}) => {
  // Set the page title on component mount
  useEffect(() => {
    handleHomeClick();
  }, []);

  return (
    <div className="content-container">
      {/* Left sidebar with filters */}
      <FiltersSidebar 
        criteria={criteria}
        handleInputChange={handleInputChange}
        isAttributeSelected={isAttributeSelected}
      />

      {/* Main content area for results */}
      <ResultsList
        results={results}
        loading={loading}
        error={error}
        hasSearched={hasSearched}
        toggleFavorite={toggleFavorite}
        toggleComments={toggleComments}
        isAuthenticated={isAuthenticated}
        navigateToLogin={navigateToLogin}
      />
    </div>
  );
};

export default HomeContent;
