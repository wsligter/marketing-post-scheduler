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
  console.log('Auth middleware called for path:', req.path, 'method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Authorization header found');
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Token found, length:', token.length);
    console.log('Token preview:', token.substring(0, 10) + '...');
    
    // Verify token
    console.log('Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully, user id:', decoded.id);
    
    // Find the user
    console.log('Finding user with id:', decoded.id);
    const user = await User.findById(decoded.id).select('-hashedPassword -salt');
    
    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }
    
    console.log('User found:', user.email, 'role:', user.role);
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.name, error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
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
