const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3002';

// Function to check available routes
async function checkRoutes() {
  try {
    console.log('Checking API routes...');
    
    // Check the root endpoint
    const rootResponse = await axios.get(API_URL);
    console.log('Root endpoint response:');
    console.log(rootResponse.data);
    
    // Try to access the health endpoint
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('\nHealth endpoint response:');
    console.log(healthResponse.data);
    
    // Try to register a user (this should work even if not authenticated)
    try {
      const registerResponse = await axios.post(`${API_URL}/api/users/register`, {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
        role: 'editor'
      });
      console.log('\nRegister endpoint response:');
      console.log(registerResponse.data);
    } catch (error) {
      console.log('\nRegister endpoint error:');
      console.log(error.response ? error.response.data : error.message);
    }
    
  } catch (error) {
    console.error('Error checking routes:', error.response ? error.response.data : error.message);
  }
}

// Run the check
checkRoutes();
