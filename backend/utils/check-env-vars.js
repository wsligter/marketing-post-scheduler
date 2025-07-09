require('dotenv').config();

console.log('Checking environment variables...');
console.log('=================================');

// MongoDB variables
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Cloudinary variables
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

// API URL
console.log('PORT:', process.env.PORT ? process.env.PORT : 'Not set (will use default)');

console.log('=================================');
