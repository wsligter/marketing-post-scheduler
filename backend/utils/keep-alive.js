/**
 * Keep-Alive Script for Render Free Tier
 * 
 * This script can be run on a cron job service (like cron-job.org) to ping
 * the backend service every 14 minutes to prevent it from sleeping.
 * 
 * Usage:
 * 1. Deploy this script to a service that can run scheduled tasks
 * 2. Set it to run every 14 minutes (Render free tier sleeps after 15 minutes of inactivity)
 */

const https = require('https');

// Configuration
const BACKEND_URL = 'https://marketing-tool-backend.onrender.com/api/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

/**
 * Ping the backend service
 */
function pingBackend() {
  console.log(`[${new Date().toISOString()}] Pinging backend service...`);
  
  https.get(BACKEND_URL, (res) => {
    const { statusCode } = res;
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (statusCode === 200) {
        try {
          const parsedData = JSON.parse(data);
          console.log(`[${new Date().toISOString()}] Backend service is alive. Status: ${parsedData.status}`);
          if (parsedData.uptime) {
            console.log(`[${new Date().toISOString()}] Service uptime: ${parsedData.uptime}`);
          }
        } catch (e) {
          console.error(`[${new Date().toISOString()}] Error parsing response: ${e.message}`);
        }
      } else {
        console.error(`[${new Date().toISOString()}] Request failed with status code: ${statusCode}`);
      }
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error pinging backend: ${err.message}`);
  });
}

// If running as a standalone script
if (require.main === module) {
  console.log(`[${new Date().toISOString()}] Keep-alive service started`);
  pingBackend(); // Ping immediately on start
  
  // For local testing, you can uncomment this to ping at regular intervals
  // setInterval(pingBackend, PING_INTERVAL);
}

module.exports = { pingBackend };
