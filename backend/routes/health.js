const express = require('express');
const router = express.Router();
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get MongoDB connection string from environment variables
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;
const appName = process.env.MONGO_APP_NAME;

// Simple health check endpoint for quick pings (useful for keeping the service alive)
router.get('/', async (req, res) => {
  try {
    // Record the startup time if it's the first request after a cold start
    if (!global.serverStartTime) {
      global.serverStartTime = new Date();
    }
    
    const uptime = new Date() - global.serverStartTime;
    const uptimeMinutes = Math.floor(uptime / 60000);
    const uptimeSeconds = Math.floor((uptime % 60000) / 1000);
    
    res.json({
      status: 'ok',
      message: 'Server is running',
      isProduction: process.env.NODE_ENV === 'production',
      uptime: `${uptimeMinutes}m ${uptimeSeconds}s`,
      freeServiceNote: process.env.NODE_ENV === 'production' ? 
        'This service is running on Render free tier and may sleep after 15 minutes of inactivity' : null,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        // Don't expose sensitive info, just check if they exist
        MONGO_USERNAME: !!username,
        MONGO_PASSWORD: !!password,
        MONGO_CLUSTER: !!cluster,
        MONGO_APP_NAME: !!appName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MongoDB connection test endpoint
router.get('/db', async (req, res) => {
  try {
    // Construct the MongoDB URI
    const uri = `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=30000&socketTimeoutMS=30000&serverSelectionTimeoutMS=30000`;
    
    // Log connection attempt
    console.log(`Health check: Connecting to MongoDB Atlas cluster: ${cluster}`);
    
    // Create a new client for this test with MongoDB Atlas recommended settings
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    // Connect to the MongoDB cluster
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    
    // Close the connection
    await client.close();
    
    res.json({
      status: 'ok',
      message: 'Successfully connected to MongoDB Atlas'
    });
  } catch (err) {
    console.error('Health check MongoDB connection error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to connect to MongoDB Atlas',
      error: err.message,
      errorDetails: {
        code: err.code,
        name: err.name,
        cause: err.cause ? err.cause.message : null,
        connectionDetails: {
          cluster: cluster,
          username: username ? '✓' : '✗',
          password: password ? '✓' : '✗',
          appName: appName ? '✓' : '✗'
        }
      }
    });
  }
});

module.exports = router;
