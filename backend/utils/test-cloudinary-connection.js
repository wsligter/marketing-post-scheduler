require('dotenv').config();
const cloudinary = require('../config/cloudinary');

/**
 * Tests the connection to Cloudinary by attempting to upload a test image
 */
async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  
  try {
    // Check if environment variables are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Error: Cloudinary environment variables are not set properly.');
      console.error('Please check your .env file and ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.');
      process.exit(1);
    }
    
    // Create a simple test image (1x1 pixel transparent PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // Test the connection by uploading the test image
    const result = await cloudinary.uploader.upload(testImageData, {
      folder: 'test',
      public_id: 'connection_test_' + Date.now()
    });
    
    if (result && result.secure_url) {
      console.log('✅ Successfully connected to Cloudinary!');
      
      // Display connection information
      console.log('\nConnection Information:');
      console.log(`- Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      console.log(`- API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 4)}...${process.env.CLOUDINARY_API_KEY.substring(process.env.CLOUDINARY_API_KEY.length - 4)}`);
      console.log(`- Test Image URL: ${result.secure_url}`);
      console.log(`- Resource Type: ${result.resource_type}`);
      console.log(`- Format: ${result.format}`);
      console.log(`- Created At: ${new Date(result.created_at).toLocaleString()}`);
      
      // Delete the test image
      await cloudinary.uploader.destroy(result.public_id);
      console.log('\nTest image deleted successfully.');
      
      console.log('\nCloudinary is properly configured and ready to use!');
    } else {
      throw new Error('Cloudinary upload test failed');
    }
  } catch (error) {
    console.error('❌ Failed to connect to Cloudinary:');
    console.error(error.message || error);
    console.error('\nPlease check your Cloudinary credentials and try again.');
    process.exit(1);
  }
}

// Run the test
testCloudinaryConnection();
