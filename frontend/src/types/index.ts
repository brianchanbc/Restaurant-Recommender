// Common types used across the application

export interface SearchCriteria {
  term: string;
  location?: string;
  limit?: number;
  radius?: number;
  price?: string;
  sort_by?: string;
  attributes?: string;
}

export interface Restaurant {
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
  commentCount?: number;
  showComments?: boolean;
}

export interface SearchResponse {
  businesses: Restaurant[];
  total: number;
  region: {
    center: {
      longitude: number;
      latitude: number;
    }
  };
}

export interface Comment {
  id: number;
  content: string;
  username: string;
  commented_at: string;
}

export interface AuthProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  errorMessage: string;
  setCurrentView: (value: string) => void;
  handleMenuClick: (value: string) => void;
}

export interface HomeContentProps {
  criteria: SearchCriteria;
  results: Restaurant[];
  loading: boolean;
  error: string;
  hasSearched: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isAttributeSelected: (attr: string) => boolean;
  toggleFavorite: (restaurant: Restaurant) => void;
  toggleComments: (restaurantId: string) => void;
  isAuthenticated: boolean;
  navigateToLogin: () => void;
  handleHomeClick: () => void;
}
