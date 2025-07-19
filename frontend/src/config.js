// Configuration file for environment-specific settings
const config = {
  // API URL with fallback to localhost for development
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3003',
};

// For single service deployment, use relative URL if we're in production
if (process.env.NODE_ENV === 'production') {
  // Check if we're using a placeholder or empty value
  if (config.apiUrl === '%REACT_APP_API_URL%' || !config.apiUrl || config.apiUrl === 'marketing-tool-backend') {
    // For single service deployment, API is at the same domain, just use relative path
    config.apiUrl = '/api';
    console.log('Single service deployment detected, using relative API URL');
  }
}

// Fix URL formatting - ensure we don't have double slashes
if (config.apiUrl.endsWith('/')) {
  config.apiUrl = config.apiUrl.slice(0, -1);
  console.log('Removed trailing slash from API URL');
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
