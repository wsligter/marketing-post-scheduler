import axios from 'axios';
import config from '../config';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
const RETRY_STATUS_CODES = [503, 504, 502]; // Service unavailable, Gateway timeout, Bad gateway

// Log the API URL being used
console.log('API Configuration:', {
  configApiUrl: config.apiUrl,
  envApiUrl: process.env.REACT_APP_API_URL,
  nodeEnv: process.env.NODE_ENV
});

// Make sure the API URL includes the protocol
let baseURL = config.apiUrl;

// Special case for Render deployment
if (baseURL === 'marketing-tool-backend') {
  baseURL = 'https://marketing-tool-backend.onrender.com';
  console.log('Detected Render service name, using full URL:', baseURL);
} else if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
  baseURL = `http://${baseURL}`;
  console.log('Added http:// protocol to URL:', baseURL);
}

// Create an axios instance with base URL from config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // This helps identify AJAX requests
    'Accept': 'application/json'  // Explicitly request JSON responses
  }
});

console.log('Axios instance created with baseURL:', baseURL);

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

// Helper function to wait for a specified delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to retry API calls when backend is spinning up
const retryApiCall = async (config, retries = 0) => {
  try {
    return await axios(config);
  } catch (error) {
    // Check if this is a status code that indicates the service might be spinning up
    const status = error.response?.status;
    
    if (RETRY_STATUS_CODES.includes(status) || !error.response) {
      // If we haven't exceeded max retries, wait and try again
      if (retries < MAX_RETRIES) {
        console.log(`Backend may be spinning up. Retrying in ${RETRY_DELAY/1000}s... (${retries + 1}/${MAX_RETRIES})`);
        
        // Show a global notification that the service is waking up
        if (retries === 0) {
          // Dispatch a custom event that can be caught by a notification component
          const event = new CustomEvent('serviceWakingUp', { detail: { isWakingUp: true } });
          window.dispatchEvent(event);
        }
        
        // Wait for the retry delay
        await sleep(RETRY_DELAY);
        
        // Try again with incremented retry count
        return retryApiCall(config, retries + 1);
      }
      
      // If we've reached max retries, clear the waking up notification
      const event = new CustomEvent('serviceWakingUp', { detail: { isWakingUp: false } });
      window.dispatchEvent(event);
    }
    
    // If it's not a retryable error or we've exceeded retries, reject with the original error
    throw error;
  }
};

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
    
    // Clear any waking up notification on successful response
    if (window.wakingUpNotificationShown) {
      const event = new CustomEvent('serviceWakingUp', { detail: { isWakingUp: false } });
      window.dispatchEvent(event);
      window.wakingUpNotificationShown = false;
    }
    
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error URL:', error.config.url);
      
      // Check if this is a status code that indicates the service might be spinning up
      if (RETRY_STATUS_CODES.includes(error.response.status)) {
        console.log('Service may be spinning up, attempting retry...');
        return retryApiCall(error.config);
      }
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
      // No response could mean the service is spinning up
      console.log('No response received, attempting retry...');
      return retryApiCall(error.config);
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
