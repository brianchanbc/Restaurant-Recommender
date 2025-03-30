import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  error: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setError: (error: string) => void;
  handleLogin: () => Promise<void>;
  handleRegister: () => Promise<void>;
  handleLogout: () => void;
  handleChangeAccount: () => Promise<void>;
  checkAuthStatus: () => void;
  validateEmail: () => boolean;
  validatePasswords: (checkRepeat: boolean) => boolean;
}

export const API_KEY_NAME = 'api_key';

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setLoginStatus] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const storedToken = localStorage.getItem(API_KEY_NAME);
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
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem(API_KEY_NAME, api_key);
    setUsername(username);
    setLoginStatus(true);
    setError('');
    navigate('/');
  };

  const clearAuthData = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem(API_KEY_NAME);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setLoginStatus(false);
    navigate('/');
  };

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Missing email');
      return false;
    }
    
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

  const handleLogin = async () => {
    if (!validateEmail() || !validatePasswords(false)) return;

    try {
      const response = await axios.get('/api/login', {
        headers: {
          email,
          password,
          'Content-Type': 'application/json',
        }
      });
      saveAuthData(response.data.username, email, password, response.data.api_key);
    } catch (error: any) {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Login failed');
      setPassword('');
    }
  }

  const handleRegister = async () => {
    if (!validateEmail() || !validatePasswords(true)) return;

    try {
      const response = await axios.post('/api/register', {}, { 
        headers: {
          'Content-Type': 'application/json',
          email,
          password
        }
      });
      saveAuthData(response.data.username, email, password, response.data.api_key);
      setPassword('');
    } catch (error: any) {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to register');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }

  const handleLogout = () => {
    clearAuthData();
  }

  const handleChangeAccount = async () => {
    if (!validatePasswords(true)) return;
    
    try {
      await axios.put('/api/change_password', {}, {
        headers: {
          'Content-Type': 'application/json',
          email,
          newPassword: password,
          apiKey: localStorage.getItem(API_KEY_NAME),
        }
      });
      localStorage.setItem("password", password);
      setConfirmPassword('');
      setError('Password changed successfully');
    } catch (error: any) {
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to change password');
      setPassword(localStorage.getItem("password") || ""); 
      setConfirmPassword('');
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    isAuthenticated,
    username,
    email,
    password,
    passwordConfirm,
    error,
    setEmail,
    setPassword,
    setConfirmPassword,
    setError,
    handleLogin,
    handleRegister,
    handleLogout,
    handleChangeAccount,
    checkAuthStatus,
    validateEmail,
    validatePasswords
  };
}
