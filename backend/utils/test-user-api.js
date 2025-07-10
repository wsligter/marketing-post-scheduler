const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3002/api/users';

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'test123',
  role: 'editor'
};

// Function to register a new user
async function registerUser() {
  try {
    console.log('Attempting to register a new user...');
    const response = await axios.post(`${API_URL}/register`, testUser);
    console.log('User registered successfully:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to login a user
async function loginUser(email, password) {
  try {
    console.log(`Attempting to login with email: ${email}...`);
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log('Login successful:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to get user profile with token
async function getUserProfile(token) {
  try {
    console.log('Fetching user profile...');
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User profile:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting profile:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to get all users (admin only)
async function getAllUsers(token) {
  try {
    console.log('Fetching all users (admin only)...');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('All users:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting all users:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Main function to run the tests
async function runTests() {
  console.log('=== Testing User API ===');
  
  // First, try to login with the default admin credentials
  const adminCredentials = {
    email: 'admin@example.com',
    password: 'admin123'
  };
  
  let adminUser = await loginUser(adminCredentials.email, adminCredentials.password);
  
  if (adminUser && adminUser.token) {
    console.log('\n=== Admin login successful ===');
    
    // Get admin profile
    await getUserProfile(adminUser.token);
    
    // Get all users (should work for admin)
    await getAllUsers(adminUser.token);
    
    // Try to register a new user
    const newUser = await registerUser();
    
    if (newUser && newUser.token) {
      console.log('\n=== New user registration successful ===');
      
      // Get new user profile
      await getUserProfile(newUser.token);
      
      // Try to get all users with new user (should fail if not admin)
      await getAllUsers(newUser.token);
    }
  } else {
    console.log('Admin login failed. Make sure the server is running and the initial admin user has been created.');
  }
  
  console.log('\n=== Tests completed ===');
}

// Run the tests
runTests();
