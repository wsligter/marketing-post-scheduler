const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes - require authentication
router.get('/profile', requireAuth, userController.getUserProfile);
router.put('/profile', requireAuth, userController.updateUserProfile);

// Admin only routes
router.get('/', requireAuth, requireAdmin, userController.getUsers);
router.get('/:id', requireAuth, requireAdmin, userController.getUserById);
router.put('/:id', requireAuth, requireAdmin, userController.updateUser);
router.delete('/:id', requireAuth, requireAdmin, userController.deleteUser);

module.exports = router;
