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

// Construct the MongoDB URI with enhanced connection options
const uri = `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=300000&heartbeatFrequencyMS=10000&ssl=true&tlsAllowInvalidCertificates=false`;

// Log connection attempt
console.log(`Connecting to MongoDB Atlas cluster: ${cluster}`);

// Create a MongoClient with enhanced connection options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Enhanced connection options for better reliability
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 300000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false
});

// Database connection function
async function connectToDatabase() {
  try {
    console.log("=== MongoDB Connection Details ===");
    console.log("Username:", username ? "✓ Set" : "✗ Missing");
    console.log("Password:", password ? "✓ Set" : "✗ Missing");
    console.log("Cluster:", cluster || "✗ Missing");
    console.log("App Name:", appName || "✗ Missing");
    console.log("Connection URI (masked):", uri.replace(/:([^:@]{1,}@)/, ':***@'));
    console.log("=====================================");
    
    console.log("Attempting to connect to MongoDB Atlas...");
    
    // Connect the client to the server
    await client.connect();
    console.log("✓ MongoDB client connected successfully");
    
    // Send a ping to confirm a successful connection
    console.log("Sending ping to verify connection...");
    await client.db("admin").command({ ping: 1 });
    console.log("✓ MongoDB ping successful - connection verified!");
    
    // Test database access
    const db = client.db("marketing-tool-tables");
    const collections = await db.listCollections().toArray();
    console.log(`✓ Database access verified - found ${collections.length} collections`);
    
    console.log("Successfully connected to MongoDB Atlas!");
    return client;
  } catch (error) {
    console.error("=== MongoDB Connection Error Details ===");
    console.error("Error Type:", error.constructor.name);
    console.error("Error Code:", error.code || "No code");
    console.error("Error Message:", error.message);
    
    if (error.cause) {
      console.error("Root Cause:", error.cause.message);
      console.error("Root Cause Code:", error.cause.code);
    }
    
    if (error.reason) {
      console.error("Connection Reason:", error.reason);
    }
    
    // Network-specific error details
    if (error.code === 'ECONNRESET' || error.message.includes('network')) {
      console.error("Network Error Details:");
      console.error("- Host:", error.host || "Unknown");
      console.error("- Port:", error.port || "Unknown");
      console.error("- This appears to be a network connectivity issue");
      console.error("- Check your internet connection and MongoDB Atlas network access settings");
    }
    
    // TLS-specific error details
    if (error.message.includes('TLS') || error.message.includes('SSL')) {
      console.error("TLS/SSL Error Details:");
      console.error("- This appears to be a TLS handshake failure");
      console.error("- Check MongoDB Atlas cluster configuration");
      console.error("- Verify that TLS 1.2+ is supported");
    }
    
    // Authentication-specific error details
    if (error.code === 18 || error.message.includes('authentication')) {
      console.error("Authentication Error Details:");
      console.error("- Check MongoDB username and password");
      console.error("- Verify database user permissions");
      console.error("- Ensure user has access to the specified database");
    }
    
    console.error("Full Error Stack:", error.stack);
    console.error("=======================================");
    
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

// Export the URI for reuse in other modules
const getMongoURI = () => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const cluster = process.env.MONGO_CLUSTER;
  const appName = process.env.MONGO_APP_NAME;
  
  return `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=300000&heartbeatFrequencyMS=10000&ssl=true&tlsAllowInvalidCertificates=false`;
};

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  client,
  getMongoURI
};
