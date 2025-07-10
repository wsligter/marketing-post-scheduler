#!/usr/bin/env node

/**
 * Render Deployment Verification Script
 * 
 * This script checks if all necessary files and configurations are in place
 * for deploying the Marketing Post Scheduler to Render.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define required files for Render deployment
const requiredFiles = [
  'render.yaml',
  'build.sh',
  'start.sh',
  'backend/.env.production',
  'frontend/.env.production',
  'backend/server.js',
  'frontend/src/config.js'
];

// Define required environment variables
const requiredEnvVars = [
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'MONGO_CLUSTER',
  'MONGO_APP_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

console.log('🔍 Verifying Render deployment configuration...\n');

// Check if required files exist
console.log('📁 Checking required files:');
let missingFiles = false;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    missingFiles = true;
  }
}

if (missingFiles) {
  console.log('\n⚠️ Some required files are missing. Please create them before deploying.');
} else {
  console.log('\n✅ All required files are present.');
}

// Check if render.yaml has the correct configuration
console.log('\n📝 Checking render.yaml configuration:');
try {
  const renderYaml = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
  
  // Check for essential services
  if (renderYaml.includes('marketing-tool-backend') && 
      renderYaml.includes('marketing-tool-frontend')) {
    console.log('✅ Both backend and frontend services are defined');
  } else {
    console.log('❌ Missing service definitions in render.yaml');
  }
  
  // Check for health check path
  if (renderYaml.includes('healthCheckPath')) {
    console.log('✅ Health check path is defined');
  } else {
    console.log('⚠️ Health check path is not defined (recommended but not required)');
  }
  
  // Check for environment variables
  if (renderYaml.includes('MONGO_USERNAME') && 
      renderYaml.includes('MONGO_PASSWORD') &&
      renderYaml.includes('MONGO_CLUSTER')) {
    console.log('✅ MongoDB environment variables are defined');
  } else {
    console.log('❌ MongoDB environment variables are not properly defined');
  }
  
  if (renderYaml.includes('CLOUDINARY_CLOUD_NAME') && 
      renderYaml.includes('CLOUDINARY_API_KEY') &&
      renderYaml.includes('CLOUDINARY_API_SECRET')) {
    console.log('✅ Cloudinary environment variables are defined');
  } else {
    console.log('❌ Cloudinary environment variables are not properly defined');
  }
} catch (error) {
  console.log(`❌ Error reading render.yaml: ${error.message}`);
}

// Check if server.js is configured to serve static files in production
console.log('\n🖥️ Checking server.js configuration:');
try {
  const serverJs = fs.readFileSync(path.join(__dirname, 'backend/server.js'), 'utf8');
  
  if (serverJs.includes('process.env.NODE_ENV === \'production\'') && 
      serverJs.includes('express.static')) {
    console.log('✅ Server is configured to serve static files in production');
  } else {
    console.log('❌ Server is not properly configured to serve static files in production');
  }
} catch (error) {
  console.log(`❌ Error reading server.js: ${error.message}`);
}

// Check if frontend config is properly set up
console.log('\n🌐 Checking frontend configuration:');
try {
  const configJs = fs.readFileSync(path.join(__dirname, 'frontend/src/config.js'), 'utf8');
  
  if (configJs.includes('process.env.REACT_APP_API_URL')) {
    console.log('✅ Frontend config is properly set up to use environment variables');
  } else {
    console.log('❌ Frontend config is not properly set up to use environment variables');
  }
} catch (error) {
  console.log(`❌ Error reading config.js: ${error.message}`);
}

// Check if build and start scripts are executable
console.log('\n📜 Checking script permissions:');
try {
  const buildStats = fs.statSync(path.join(__dirname, 'build.sh'));
  const startStats = fs.statSync(path.join(__dirname, 'start.sh'));
  
  if ((buildStats.mode & 0o111) !== 0) {
    console.log('✅ build.sh is executable');
  } else {
    console.log('❌ build.sh is not executable. Run: chmod +x build.sh');
  }
  
  if ((startStats.mode & 0o111) !== 0) {
    console.log('✅ start.sh is executable');
  } else {
    console.log('❌ start.sh is not executable. Run: chmod +x start.sh');
  }
} catch (error) {
  console.log(`❌ Error checking script permissions: ${error.message}`);
}

console.log('\n🏁 Verification complete!');
console.log('If all checks passed, your application is ready to be deployed to Render.');
console.log('For deployment instructions, see RENDER_DEPLOYMENT.md');
