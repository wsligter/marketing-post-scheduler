const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variables or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// Middleware to check if the user is authenticated
exports.requireAuth = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id).select('-hashedPassword -salt');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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
