const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectToDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001 to avoid conflicts

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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
    
    // Construct the MongoDB URI for Mongoose
    const uri = `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}`;
    
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

// Use routes
app.use('/api/posts', postsRoutes);
app.use('/api/campaigns', campaignsRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
