// Helper functions used across the application

// Helper functions for unit conversion
export const metersToKm = (meters: number): number => meters / 1000;

export const kmToMeters = (km: number): number => Math.round(km * 1000);

// Format date strings
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; errorMessage?: string } => {
  if (!email) {
    return { isValid: false, errorMessage: 'Missing email' };
  }
  
  if (!email.includes('@')) {
    return { isValid: false, errorMessage: 'Invalid email format' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (
  password: string, 
  confirmPassword?: string
): { isValid: boolean; errorMessage?: string } => {
  if (!password) {
    return { isValid: false, errorMessage: 'Missing password' };
  }

  if (password.length < 8) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters long.' };
  }
  
  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      return { isValid: false, errorMessage: 'Please confirm your password' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, errorMessage: 'Passwords do not match' };
    }
  }
  
  return { isValid: true };
};

// Authentication helpers
export const checkAuthStatus = (): boolean => {
  const apiKey = localStorage.getItem('api_key');
  return !!apiKey;
};

// Text formatting helpers
export const formatFavoriteCount = (count: number): string => {
  return count <= 1 
    ? `${count} Partner Loves This` 
    : `${count} Partners Love This`;
};
