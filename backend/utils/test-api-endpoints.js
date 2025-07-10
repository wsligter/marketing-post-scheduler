const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3002';
const TEST_EMAIL = 'test@test.nl';
const TEST_PASSWORD = 'Kodify2026!';

console.log('Testing API endpoints at:', API_URL);

// Test the API endpoints
async function testAPI() {
  try {
    console.log('\n=== Testing Health Endpoint ===');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('Health check response:', healthResponse.data);
    
    console.log('\n=== Testing Authentication ===');
    console.log('Attempting login with:', TEST_EMAIL);
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response data keys:', Object.keys(loginResponse.data));
    
    if (!loginResponse.data.token) {
      throw new Error('No token received in login response');
    }
    
    const token = loginResponse.data.token;
    console.log('Token received, length:', token.length);
    console.log('Token preview:', `${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
    
    // Set up headers with token for authenticated requests
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    console.log('\n=== Testing User Profile Endpoint ===');
    const profileResponse = await axios.get(`${API_URL}/api/users/profile`, { headers });
    console.log('Profile response status:', profileResponse.status);
    console.log('Profile data:', profileResponse.data);
    
    console.log('\n=== Testing Campaigns Endpoint ===');
    const campaignsResponse = await axios.get(`${API_URL}/api/campaigns`, { headers });
    console.log('Campaigns response status:', campaignsResponse.status);
    console.log('Campaigns data type:', typeof campaignsResponse.data);
    console.log('Is array?', Array.isArray(campaignsResponse.data));
    console.log('Campaigns count:', Array.isArray(campaignsResponse.data) ? campaignsResponse.data.length : 'Not an array');
    
    if (Array.isArray(campaignsResponse.data) && campaignsResponse.data.length > 0) {
      console.log('First campaign sample:', campaignsResponse.data[0]);
    }
    
    console.log('\n=== Testing Posts Endpoint ===');
    const postsResponse = await axios.get(`${API_URL}/api/posts`, { headers });
    console.log('Posts response status:', postsResponse.status);
    console.log('Posts data type:', typeof postsResponse.data);
    console.log('Is array?', Array.isArray(postsResponse.data));
    console.log('Posts count:', Array.isArray(postsResponse.data) ? postsResponse.data.length : 'Not an array');
    
    if (Array.isArray(postsResponse.data) && postsResponse.data.length > 0) {
      console.log('First post sample:', postsResponse.data[0]);
    }
    
    console.log('\n=== API Tests Completed Successfully ===');
  } catch (error) {
    console.error('\n=== API Test Failed ===');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
    }
    
    console.error('Full error:', error);
  }
}

// Run the tests
testAPI();
