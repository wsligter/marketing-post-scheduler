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
      
      // Handle special cases for API URL
      if (loginUrl === 'marketing-tool-backend') {
        loginUrl = 'https://marketing-tool-backend.onrender.com';
      }
      
      // Add protocol if missing
      if (!loginUrl.startsWith('http://') && !loginUrl.startsWith('https://') && !loginUrl.startsWith('/')) {
        loginUrl = `http://${loginUrl}`;
      }
      
      // Construct the login endpoint URL
      let loginEndpoint;
      if (loginUrl.endsWith('/api')) {
        // If API_URL already ends with /api, don't add it again
        loginEndpoint = `${loginUrl}/users/login`;
      } else if (loginUrl === '/api') {
        // If it's a relative URL
        loginEndpoint = `${loginUrl}/users/login`;
      } else {
        // Otherwise add /api/
        loginEndpoint = `${loginUrl}/api/users/login`;
      }
      
      console.log('Making login request to:', loginEndpoint);
      
      // Use regular axios for login since we don't have a token yet
      const response = await axios.post(loginEndpoint, 
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
      // Redirect to dashboard on successful login
      try {
        // Use replace to avoid keeping /login in history
        window.location.assign('/dashboard');
      } catch (navErr) {
        console.warn('Navigation to /dashboard failed, continuing:', navErr);
      }

      return true;
    } catch (err) {
      console.error('Login error occurred:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      
      // Provide clearer, user-friendly error messages
      let userFriendlyMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        
        console.log('Server error response:', { status, serverMessage });
        
        switch (status) {
          case 400:
            userFriendlyMessage = serverMessage || 'Please check your email and password.';
            break;
          case 401:
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 403:
            userFriendlyMessage = 'Access denied. Please contact your administrator.';
            break;
          case 500:
            userFriendlyMessage = 'Server error. Please try again in a few moments.';
            break;
          case 503:
            userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.';
            break;
          case 504:
            userFriendlyMessage = 'Connection timeout. Please check your internet connection and try again.';
            break;
          default:
            userFriendlyMessage = serverMessage || `Login failed (Error ${status}). Please try again.`;
        }
      } else if (err.request) {
        // Network error - no response received
        console.error('Network error - no response received:', err.request);
        userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        // Something else happened
        console.error('Unexpected error during login setup:', err.message);
        userFriendlyMessage = 'An unexpected error occurred. Please try again.';
      }
      
      console.log('Setting user-friendly error message:', userFriendlyMessage);
      setError(userFriendlyMessage);
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
      console.error('Profile update error occurred:', err);
      console.error('Profile update error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });
      
      // Provide clearer, user-friendly error messages
      let userFriendlyMessage = 'Failed to update profile. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        
        console.log('Profile update server error response:', { status, serverMessage });
        
        switch (status) {
          case 400:
            userFriendlyMessage = serverMessage || 'Please check your profile information and try again.';
            break;
          case 401:
            userFriendlyMessage = 'Your session has expired. Please log in again.';
            break;
          case 403:
            userFriendlyMessage = 'You do not have permission to update this profile.';
            break;
          case 409:
            userFriendlyMessage = 'This email is already in use. Please choose a different email.';
            break;
          case 422:
            userFriendlyMessage = 'Please check that all fields are filled out correctly.';
            break;
          case 500:
            userFriendlyMessage = 'Server error while updating profile. Please try again in a few moments.';
            break;
          case 503:
            userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.';
            break;
          default:
            userFriendlyMessage = serverMessage || `Profile update failed (Error ${status}). Please try again.`;
        }
      } else if (err.request) {
        console.error('Profile update network error - no response received:', err.request);
        userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        console.error('Unexpected profile update error:', err.message);
        userFriendlyMessage = 'An unexpected error occurred while updating your profile. Please try again.';
      }
      
      console.log('Setting profile update error message:', userFriendlyMessage);
      setError(userFriendlyMessage);
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
      
      // Redirect to dashboard after successful registration
      try {
        window.location.assign('/dashboard');
      } catch (navErr) {
        console.warn('Navigation to /dashboard failed after registration:', navErr);
      }
      
      return true;
    } catch (error) {
      console.error('Registration error occurred:', error);
      console.error('Registration error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // Provide clearer, user-friendly error messages
      let userFriendlyMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        console.log('Registration server error response:', { status, serverMessage });
        
        switch (status) {
          case 400:
            userFriendlyMessage = serverMessage || 'Please check your registration information and try again.';
            break;
          case 409:
            userFriendlyMessage = 'An account with this email already exists. Please use a different email or try logging in.';
            break;
          case 422:
            userFriendlyMessage = 'Please check that all required fields are filled out correctly.';
            break;
          case 500:
            userFriendlyMessage = 'Server error during registration. Please try again in a few moments.';
            break;
          case 503:
            userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.';
            break;
          default:
            userFriendlyMessage = serverMessage || `Registration failed (Error ${status}). Please try again.`;
        }
      } else if (error.request) {
        console.error('Registration network error - no response received:', error.request);
        userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        console.error('Unexpected registration error:', error.message);
        userFriendlyMessage = 'An unexpected error occurred during registration. Please try again.';
      }
      
      console.log('Setting registration error message:', userFriendlyMessage);
      setError(userFriendlyMessage);
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
