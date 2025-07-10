// Configuration file for environment-specific settings
const config = {
  // API URL with fallback to localhost for development
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3002',
};

export default config;
