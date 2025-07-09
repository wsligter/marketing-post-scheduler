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
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=${appName}`;

async function testConnection() {
  const client = new MongoClient(uri, { 
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Try with IPv4 explicitly if you're having connection issues
    family: 4
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB");
    
    // List the databases
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:");
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (e) {
    console.error("Connection error:", e);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error);
