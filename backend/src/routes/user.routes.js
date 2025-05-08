const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} = require('../controllers/user.controller');

// GET /api/users - Get all users (admin only)
router.get('/', [verifyToken, isAdmin], getAllUsers);

// GET /api/users/profile - Get current user's profile
router.get('/profile', verifyToken, getUserProfile);

// PUT /api/users/profile - Update current user's profile
router.put('/profile', [verifyToken, upload.single('avatar')], updateUserProfile);

// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', [verifyToken, isAdmin], deleteUser);

module.exports = router; 