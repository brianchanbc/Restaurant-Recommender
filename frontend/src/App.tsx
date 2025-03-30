import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import Favorite from './components/Favorite';
import HomeContent from './components/search/HomeContent';
import Header from './components/layout/Header';

// Custom hooks
import { useAuth, API_KEY_NAME } from './hooks/useAuth';
import { useRestaurants } from './hooks/useRestaurants';

function App() {
  // Current active page/route
  const [activePage, setCurrentView] = useState<string>('/');
  const navigate = useNavigate();

  // Custom hooks
  const auth = useAuth();
  const restaurants = useRestaurants(auth.isAuthenticated);
  
  // Navigation handlers
  const handleMenuClick = (targetPage: string) => {
    if (targetPage === 'logout') {
      setCurrentView('/');
      navigate('/');
      return;
    }
    if ((targetPage === 'account' || targetPage === 'favorite') && !auth.isAuthenticated) {
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

  // Navigate to login when needed for comments
  const navigateToLogin = () => {
    setCurrentView('/login');
    navigate('/login');
  };

  // Props for components
  const authProps = {
    email: auth.email,
    setEmail: auth.setEmail,
    password: auth.password,
    setPassword: auth.setPassword,
    errorMessage: auth.error,
    setCurrentView,
    handleMenuClick,
    handleLogin: auth.handleLogin 
  };

  const registerAccountProps = {
    ...authProps,
    confirmPassword: auth.passwordConfirm,
    setConfirmPassword: auth.setConfirmPassword,
    handleRegister: auth.handleRegister  
  };

  const changeAccountProps = {
    username: auth.username,
    password: auth.password,
    setPassword: auth.setPassword,
    errorMessage: auth.error,
    setCurrentView,
    handleMenuClick,
    confirmPassword: auth.passwordConfirm,
    setConfirmPassword: auth.setConfirmPassword,
    handleChangeAccount: auth.handleChangeAccount  
  }

  const favoriteProps = {
    favorites: restaurants.favorites,
    toggleFavorite: restaurants.toggleFavorite,
    error: restaurants.error,
    isLoading: restaurants.favoritesLoading 
  }

  const homeContentProps = {
    criteria: restaurants.criteria,
    results: restaurants.results,
    loading: restaurants.loading,
    error: restaurants.error,
    hasSearched: restaurants.hasSearched,
    handleInputChange: restaurants.handleInputChange,
    isAttributeSelected: restaurants.isAttributeSelected,
    toggleFavorite: restaurants.toggleFavorite,
    toggleComments: restaurants.toggleComments,
    isAuthenticated: auth.isAuthenticated,
    navigateToLogin,
    handleHomeClick
  };

  const headerProps = {
    activePage,
    isAuthenticated: auth.isAuthenticated,
    handleMenuClick,
    handleHomeClick,
    handleSearch: restaurants.handleSearch,
    criteria: restaurants.criteria,
    handleInputChange: restaurants.handleInputChange,
    loading: restaurants.loading,
    handleLogout: auth.handleLogout
  };

  return (
    <div className="app-container">
      <Header {...headerProps} />
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomeContent {...homeContentProps} />} />
          
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
            localStorage.getItem(API_KEY_NAME) ? (
              <div className="auth-container">
                <Account {...changeAccountProps} />
              </div>
            ) : (
              <Navigate replace to={"/login"} />
            )
          } />
          
          <Route path="/favorite" element={
            localStorage.getItem(API_KEY_NAME) ? (
              <Favorite {...favoriteProps} />
            ) : (
              <Navigate replace to={"/login"} />
            )
          } />
          
          <Route path="*" element={
            localStorage.getItem(API_KEY_NAME) ? 
            <Navigate to="/" /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
