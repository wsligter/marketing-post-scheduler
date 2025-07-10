const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectToDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002; // Using port 3002 as default

// Get frontend URL from environment variable or use default values
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

// Middleware
app.use(cors({
  origin: [
    frontendUrl,
    'http://localhost:3002', 
    'http://localhost:8081'
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB Atlas
let dbClient;
connectToDatabase()
  .then(client => {
    dbClient = client;
    console.log('MongoDB Atlas connected');
    
    // Get MongoDB connection string from environment variables
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const cluster = process.env.MONGO_CLUSTER;
    const appName = process.env.MONGO_APP_NAME;
    
    // Construct the MongoDB URI for Mongoose with additional connection options
    const uri = `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=30000&socketTimeoutMS=30000&maxIdleTimeMS=120000&serverSelectionTimeoutMS=30000`;
    
    // Connect Mongoose to the same MongoDB Atlas instance
    return mongoose.connect(uri);
  })
  .then(() => console.log('Mongoose connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Import models
const Campaign = require('./models/Campaign');
const Post = require('./models/Post');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Marketing Tool API' });
});

// Import routes
const postsRoutes = require('./routes/posts');
const campaignsRoutes = require('./routes/campaigns');
const healthRoutes = require('./routes/health');

// Use routes
app.use('/api/posts', postsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/health', healthRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
