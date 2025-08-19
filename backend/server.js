const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectToDatabase } = require('./config/database');

// Determine if we're running in production
const isProduction = process.env.NODE_ENV === 'production';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003; // Using port 3003 as default

// Get frontend URL from environment variable or use default values
let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

// Handle Render deployment where only the service name is provided
if (frontendUrl === 'marketing-tool-frontend') {
  frontendUrl = 'https://marketing-tool-frontend.onrender.com';
  console.log('Detected Render service name for frontend, using full URL:', frontendUrl);
}

// Ensure URL has protocol
if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
  frontendUrl = `https://${frontendUrl}`;
  console.log('Added https:// protocol to frontend URL:', frontendUrl);
}

// Log CORS configuration
console.log('CORS configuration:');
console.log('- Frontend URL from env:', process.env.FRONTEND_URL || 'not set');
console.log('- Using frontend URL:', frontendUrl);

// Middleware
app.use(cors({
  origin: [
    frontendUrl,
    'http://localhost:3000',  // React dev server default
    'http://localhost:3001',  // Alternative port
    'http://localhost:3002',  // Old backend port
    'http://localhost:3003',  // New backend port
    'http://localhost:8080',  // Common frontend port
    'http://localhost:8081',  // Current frontend port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
    // Render deployment URLs
    'https://marketing-tool-frontend.onrender.com',
    'https://marketing-tool-backend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});
app.use(express.json());

// Connect to MongoDB Atlas
let dbClient;
let isDbConnected = false;

// Database connection with retry logic
async function initializeDatabase() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Database connection attempt ${retryCount + 1}/${maxRetries}`);
      
      // Check if required environment variables are present
      const requiredEnvVars = ['MONGO_USERNAME', 'MONGO_PASSWORD', 'MONGO_CLUSTER', 'MONGO_APP_NAME'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }
      
      // Connect to MongoDB Atlas
      dbClient = await connectToDatabase();
      console.log('MongoDB Atlas connected');
      
      // Use the shared URI configuration from database.js
      const { getMongoURI } = require('./config/database');
      const uri = getMongoURI();
      
      // Connect Mongoose using the same configuration
      await mongoose.connect(uri);
      console.log('Mongoose connected to MongoDB Atlas');
      
      isDbConnected = true;
      
      // Create initial admin user if no users exist
      const { createInitialAdmin } = require('./controllers/userController');
      await createInitialAdmin();
      
      console.log('Database initialization completed successfully');
      break;
      
    } catch (err) {
      retryCount++;
      console.error(`=== Database Connection Attempt ${retryCount}/${maxRetries} Failed ===`);
      console.error('Error Type:', err.constructor.name);
      console.error('Error Code:', err.code || 'No code');
      console.error('Error Message:', err.message);
      
      // Log specific error details
      if (err.cause) {
        console.error('Root Cause:', err.cause.message);
        console.error('Root Cause Code:', err.cause.code);
      }
      
      if (err.reason && err.reason.servers) {
        console.error('Server Status:');
        for (const [server, status] of err.reason.servers) {
          console.error(`- ${server}: ${status.error ? status.error.message : 'Unknown error'}`);
        }
      }
      
      // Environment variable check on failure
      const requiredVars = ['MONGO_USERNAME', 'MONGO_PASSWORD', 'MONGO_CLUSTER', 'MONGO_APP_NAME'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        console.error('Missing Environment Variables:', missingVars);
      }
      
      if (retryCount >= maxRetries) {
        console.error('=== ALL DATABASE CONNECTION ATTEMPTS FAILED ===');
        console.error('Server will start but database operations will fail.');
        console.error('This means:');
        console.error('- Login attempts will fail');
        console.error('- API endpoints will return database errors');
        console.error('- Application will not function properly');
        console.error('');
        console.error('Troubleshooting steps:');
        console.error('1. Check your internet connection');
        console.error('2. Verify MongoDB Atlas cluster is running');
        console.error('3. Check environment variables in .env file');
        console.error('4. Verify MongoDB Atlas IP whitelist settings');
        console.error('5. Check MongoDB Atlas user permissions');
        console.error('');
        console.error('Full error details:');
        console.error(err);
        console.error('===============================================');
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Initialize database connection
initializeDatabase();

// Import models
const Campaign = require('./models/Campaign');
const Post = require('./models/Post');
const User = require('./models/User');

// API status route (moved from root to avoid blocking frontend)
app.get('/api/status', (req, res) => {
  res.json({ message: 'Welcome to the Marketing Tool API', status: 'running' });
});

// Import routes
const postsRoutes = require('./routes/posts');
const campaignsRoutes = require('./routes/campaigns');
const healthRoutes = require('./routes/health');
const usersRoutes = require('./routes/users');
const systemPromptsRoutes = require('./routes/systemPrompts');
const aiRoutes = require('./routes/ai');
const companyInfoRoutes = require('./routes/companyInfo');

// Use routes
app.use('/api/posts', postsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/system-prompts', systemPromptsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/company-info', companyInfoRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const frontendBuildPath = path.resolve(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));

  // Handle any requests that don't match the API routes
  app.get('*', (req, res) => {
    // Exclude API routes from being redirected to the React app
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Add startup notification for free tier
  if (isProduction) {
    console.log('='.repeat(80));
    console.log('IMPORTANT: Running on Render free tier');
    console.log('This service will sleep after 15 minutes of inactivity');
    console.log('First request after inactivity will take 30-60 seconds to respond');
    console.log('='.repeat(80));
    
    // Record server start time for uptime tracking
    global.serverStartTime = new Date();
  }
});
