const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password, // This will use the virtual setter to hash the password
      role: role || 'view-only' // Default to view-only if no role provided
    });

    // Save user to database
    await user.save();

    // Return user data without sensitive information
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Admin: Generate a one-time password reset token and return a copyable URL
exports.generatePasswordReset = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    user.updatedAt = Date.now();
    await user.save();

    // Build a reset URL for convenience
    const baseFromEnv = process.env.APP_BASE_URL || process.env.FRONTEND_BASE_URL || '';
    const origin = req.headers.origin || baseFromEnv;
    const resetPath = '/reset-password?token=' + rawToken;
    const resetUrl = origin ? `${origin.replace(/\/$/, '')}${resetPath}` : resetPath;

    return res.json({
      message: 'Reset token generated',
      resetToken: rawToken,
      resetUrl,
      expiresAt
    });
  } catch (error) {
    console.error('Generate password reset error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public: Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and newPassword are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password via virtual to re-hash
    user.password = newPassword;
    // Invalidate token
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.updatedAt = Date.now();
    await user.save();

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    console.log('Login attempt started for:', req.body.email);
    
    // Validate request body
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing email or password in request');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ message: 'Database connection unavailable. Please try again in a moment.' });
    }

    console.log('Searching for user with email:', email);
    
    // Find user by email with timeout
    const user = await Promise.race([
      User.findOne({ email }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]);
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, checking password for:', email);
    
    // Check if password is correct
    if (!user.authenticate(password)) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Password valid, generating token for:', email);
    
    // Generate token with error handling
    let token;
    try {
      token = generateToken(user);
      if (!token) {
        throw new Error('Token generation failed');
      }
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ message: 'Authentication token generation failed' });
    }

    console.log('Login successful for:', email);
    
    // Return user data with token
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('Login user error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.message === 'Database query timeout') {
      return res.status(504).json({ message: 'Database query timeout. Please try again.' });
    }
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ message: 'Database connection error. Please try again in a moment.' });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: 'Server error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      timezone: req.user.timezone || 'CET',
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.timezone = req.body.timezone || user.timezone;
    
    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update timestamp
    user.updatedAt = Date.now();

    // Save updated user
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      timezone: updatedUser.timezone,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get users for assignment (excluding admin users)
exports.getUsersForAssignment = async (req, res) => {
  try {
    const users = await User.find({
      $and: [
        { email: { $not: /^admin@/ } }, // Exclude emails starting with 'admin@'
        { firstName: { $ne: 'admin' } }, // Exclude first name 'admin' (case sensitive)
        { lastName: { $ne: 'admin' } }, // Exclude last name 'admin' (case sensitive)
        { firstName: { $not: /^admin$/i } }, // Exclude first name 'admin' (case insensitive)
        { lastName: { $not: /^admin$/i } } // Exclude last name 'admin' (case insensitive)
      ]
    }).select('firstName lastName email');
    res.json(users);
  } catch (error) {
    console.error('Get users for assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-hashedPassword -salt');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-hashedPassword -salt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Update timestamp
    user.updatedAt = Date.now();
    
    // Save updated user
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create initial admin user if no users exist
exports.createInitialAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123', // This should be changed immediately after first login
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Initial admin user created');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Please change this password after first login');
    }
  } catch (error) {
    console.error('Create initial admin error:', error);
  }
};
