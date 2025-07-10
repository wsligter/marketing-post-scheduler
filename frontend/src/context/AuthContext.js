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
    console.log('Attempting login for:', email);
    
    try {
      // Make sure API_URL is correct
      let loginUrl = API_URL;
      if (loginUrl === 'marketing-tool-backend') {
        loginUrl = 'https://marketing-tool-backend.onrender.com';
      }
      if (!loginUrl.startsWith('http://') && !loginUrl.startsWith('https://')) {
        loginUrl = `http://${loginUrl}`;
      }
      
      console.log('Making login request to:', `${loginUrl}/api/users/login`);
      
      // Use regular axios for login since we don't have a token yet
      const response = await axios.post(`${loginUrl}/api/users/login`, 
        { email, password },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      console.log('Login response data type:', typeof response.data);
      console.log('Login response data keys:', response.data ? Object.keys(response.data) : 'No data');
      console.log('Token in response:', response.data && response.data.token ? `Token exists (${response.data.token.substring(0, 10)}...)` : 'No token');
      
      if (!response.data || !response.data.token) {
        console.error('No token received in login response!');
        console.error('Full response data:', JSON.stringify(response.data));
        setError('Authentication failed: No token received');
        setLoading(false);
        return false;
      }
      
      // Store token in localStorage
      console.log('Token to store:', response.data.token);
      console.log('Token length:', response.data.token ? response.data.token.length : 0);
      localStorage.setItem('token', response.data.token);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      console.log('Token stored in localStorage:', storedToken ? 'Yes' : 'No');
      console.log('Stored token matches original:', storedToken === response.data.token);
      
      // If remember me is checked, save email to localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      console.log('Response data structure:', Object.keys(response.data));
      
      // Make sure we have the user data in the response
      if (!response.data.user && response.data._id) {
        // If user data is directly in the response
        console.log('User data directly in response');
        setUser(response.data);
      } else if (response.data.user) {
        // If user data is nested in a user property
        console.log('User data in user property');
        setUser(response.data.user);
      } else {
        // Fetch user profile if not included in login response
        console.log('No user data in response, fetching profile...');
        // Use our API utility which will automatically include the token
        try {
          const profileResponse = await api.get('/api/users/profile');
          console.log('Profile response:', profileResponse);
          setUser(profileResponse.data);
        } catch (profileErr) {
          console.error('Error fetching profile after login:', profileErr);
          console.error('Profile error details:', profileErr.response ? profileErr.response.data : 'No response data');
          // Still consider login successful if we have a token
        }
      }
      
      console.log('Final user state after login:', user);
      
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
