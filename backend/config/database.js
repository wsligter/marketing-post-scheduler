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

// Construct the MongoDB URI
const uri = `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=30000&socketTimeoutMS=30000&serverSelectionTimeoutMS=30000`;

// Log connection attempt
console.log(`Connecting to MongoDB Atlas cluster: ${cluster}`);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database connection function
async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB Atlas!");
    
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Function to close the connection
async function closeDatabaseConnection() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  client
};
