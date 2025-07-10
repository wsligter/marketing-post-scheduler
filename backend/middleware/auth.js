const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variables or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// Debug JWT secret configuration
console.log('JWT_SECRET environment variable exists:', !!process.env.JWT_SECRET);
console.log('Using JWT_SECRET from:', process.env.JWT_SECRET ? 'environment variable' : 'default development value');
// Don't log the actual secret in production, but for debugging we'll log a hint
if (process.env.NODE_ENV !== 'production') {
  console.log('JWT_SECRET hint (first 4 chars):', JWT_SECRET.substring(0, 4));
}

// Middleware to check if the user is authenticated
exports.requireAuth = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE START ===');
  console.log(`Auth middleware called for ${req.method} ${req.path}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request origin:', req.headers.origin || 'No origin header');
  console.log('Request host:', req.headers.host || 'No host header');
  
  // Check if the request is coming from a browser or API client
  const isAPIRequest = req.headers['x-requested-with'] === 'XMLHttpRequest' || 
                       req.headers['accept']?.includes('application/json');
  console.log('Is API request:', isAPIRequest ? 'Yes' : 'No');
  
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Authorization header found');
      console.log('Auth header value:', authHeader || 'undefined');
      return res.status(401).json({ 
        message: 'Authentication required. No token provided.',
        error: 'missing_token'
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Token found, length:', token.length);
    console.log('Token preview:', token.substring(0, 10) + '...' + token.substring(token.length - 5));
    
    // Verify token
    console.log('Verifying token with JWT_SECRET');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      if (!decoded.id) {
        console.error('Token missing user ID in payload');
        return res.status(401).json({ 
          message: 'Invalid token format: missing user ID',
          error: 'invalid_token_format'
        });
      }
      
      // Find the user
      console.log('Finding user with id:', decoded.id);
      const user = await User.findById(decoded.id).select('-hashedPassword -salt');
      
      if (!user) {
        console.log('User not found for id:', decoded.id);
        return res.status(401).json({ 
          message: 'User not found or token is invalid',
          error: 'user_not_found'
        });
      }
      
      console.log('User found:', user.email, 'role:', user.role);
      console.log('Authentication successful');
      
      // Add user to request object
      req.user = user;
      console.log('=== AUTH MIDDLEWARE END (SUCCESS) ===');
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.name, jwtError.message);
      return res.status(401).json({ 
        message: 'Token verification failed: ' + jwtError.message,
        error: 'token_verification_failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.name, error.message);
    console.error(error.stack);
    console.log('=== AUTH MIDDLEWARE END (ERROR) ===');
    return res.status(401).json({ 
      message: 'Authentication failed: ' + error.message,
      error: 'auth_error'
    });
  }
};

// Middleware to check if user has admin role
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user has editor role or higher
exports.requireEditor = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Editor privileges required.' });
  }
};

// Middleware to check if user has reviewer role or higher
exports.requireReviewer = (req, res, next) => {
  if (req.user && ['admin', 'editor', 'reviewer'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Reviewer privileges required.' });
  }
};

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};
