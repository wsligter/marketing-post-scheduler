// Configuration file for environment-specific settings
const config = {
  // API URL with fallback to localhost for development
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3002',
};

// Fix for Render deployment where service name might be used instead of full URL
if (config.apiUrl === 'marketing-tool-backend') {
  config.apiUrl = 'https://marketing-tool-backend.onrender.com';
}

// Log detailed API configuration for debugging
console.log('API Configuration:', {
  configApiUrl: config.apiUrl,
  envApiUrl: process.env.REACT_APP_API_URL,
  nodeEnv: process.env.NODE_ENV
});

// Log the API URL being used
console.log('Config: Using API URL:', config.apiUrl);

export default config;
