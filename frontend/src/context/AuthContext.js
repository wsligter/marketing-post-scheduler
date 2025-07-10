import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import api from '../utils/api';

// Get API URL from config file
const API_URL = config.apiUrl;

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check if token exists in local storage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Fetch user profile using our API utility (which automatically adds the token)
        const response = await api.get('/api/users/profile');
        
        // Set user state
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Auto-login error:', error);
        // Clear token if invalid
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      // Use regular axios for login since we don't have a token yet
      const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // If remember me is checked, save email to localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Make sure we have the user data in the response
      if (!response.data.user && response.data._id) {
        // If user data is directly in the response
        setUser(response.data);
      } else if (response.data.user) {
        // If user data is nested in a user property
        setUser(response.data.user);
      } else {
        // Fetch user profile if not included in login response
        // Use our API utility which will automatically include the token
        try {
          const profileResponse = await api.get('/api/users/profile');
          setUser(profileResponse.data);
        } catch (profileErr) {
          console.error('Error fetching profile after login:', profileErr);
          // Still consider login successful if we have a token
        }
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Use our API utility which will automatically include the token
      const response = await api.put('/api/users/profile', userData);
      
      // Update user state with new data
      setUser(response.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Use our API utility which will automatically include the token
      const response = await api.post('/api/users/register', userData);
      const { token, user } = response.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(user);
      
      return true;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
