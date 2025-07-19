const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

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

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    if (!user.authenticate(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user data with token
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Login user error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
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
