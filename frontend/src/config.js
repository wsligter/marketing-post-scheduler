// Configuration file for environment-specific settings
const config = {
  // API URL with fallback to localhost for development
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3002',
};

// Log the API URL being used
console.log('Config: Using API URL:', config.apiUrl);

export default config;
