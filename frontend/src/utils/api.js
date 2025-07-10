import axios from 'axios';
import config from '../config';

// Create an axios instance with base URL from config
const api = axios.create({
  baseURL: config.apiUrl
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Token exists:', token ? 'Yes' : 'No');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('No token found in localStorage for API request');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.method.toUpperCase(), response.config.url);
    console.log('Response data type:', typeof response.data);
    console.log('Is array?', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log('Array length:', response.data.length);
    } else if (typeof response.data === 'object' && response.data !== null) {
      console.log('Object keys:', Object.keys(response.data));
    }
    
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error URL:', error.config.url);
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
    }
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized error - clearing token and redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
