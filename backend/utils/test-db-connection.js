const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from common locations so the script works from any CWD
(() => {
  const candidates = [
    // backend/.env (when running inside backend or its subfolders)
    path.resolve(__dirname, '../.env'),
    // project root .env
    path.resolve(__dirname, '../../.env'),
    // local folder fallback (backend/utils/.env)
    path.resolve(__dirname, '.env')
  ];

  let loaded = false;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      console.log(`[env] Loaded environment from: ${p}`);
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    console.warn('[env] No .env file found. Proceeding with process environment only.');
  }
})();

async function testConnection() {
  console.log('=== MongoDB Connection Test ===');
  
  // Get credentials
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const cluster = process.env.MONGO_CLUSTER;
  const appName = process.env.MONGO_APP_NAME;
  
  console.log('Environment Variables:');
  console.log('- MONGO_USERNAME:', username ? '✓ Set' : '✗ Missing');
  console.log('- MONGO_PASSWORD:', password ? '✓ Set' : '✗ Missing');
  console.log('- MONGO_CLUSTER:', cluster || '✗ Missing');
  console.log('- MONGO_APP_NAME:', appName || '✗ Missing');
  
  if (!username || !password || !cluster || !appName) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  // Test different connection configurations
  const configs = [
    {
      name: 'Basic Connection',
      uri: `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority`,
      options: {}
    },
    {
      name: 'With App Name',
      uri: `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}`,
      options: {}
    },
    {
      name: 'With Timeouts',
      uri: `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}`,
      options: {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000
      }
    },
    {
      name: 'Current Configuration',
      uri: `mongodb+srv://${username}:${password}@${cluster}/marketing-tool-tables?retryWrites=true&w=majority&appName=${appName}&connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=300000&heartbeatFrequencyMS=10000&ssl=true&tlsAllowInvalidCertificates=false`,
      options: {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
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
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n--- Testing: ${config.name} ---`);
    console.log('URI (masked):', config.uri.replace(/:([^:@]{1,}@)/, ':***@'));
    
    const client = new MongoClient(config.uri, config.options);
    
    try {
      console.log('⏳ Connecting...');
      const startTime = Date.now();
      
      // Set a timeout for the connection attempt
      const connectionPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      
      const connectTime = Date.now() - startTime;
      console.log(`✓ Connected successfully in ${connectTime}ms`);
      
      // Test ping
      console.log('⏳ Testing ping...');
      const pingStart = Date.now();
      await client.db('admin').command({ ping: 1 });
      const pingTime = Date.now() - pingStart;
      console.log(`✓ Ping successful in ${pingTime}ms`);
      
      // Test database access
      console.log('⏳ Testing database access...');
      const db = client.db('marketing-tool-tables');
      const collections = await db.listCollections().toArray();
      console.log(`✓ Database accessible - found ${collections.length} collections`);
      
      // List collections
      if (collections.length > 0) {
        console.log('Collections:', collections.map(c => c.name).join(', '));
      }
      
      await client.close();
      console.log('✓ Connection closed successfully');
      
      // If we get here, this config works
      console.log(`\n🎉 SUCCESS: ${config.name} works!`);
      break;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      console.log('Error type:', error.constructor.name);
      if (error.code) console.log('Error code:', error.code);
      if (error.cause) console.log('Root cause:', error.cause.message);
      
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testConnection().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
