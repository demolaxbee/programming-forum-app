const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  searchByKeyword,
  searchByUsername,
  getUsersWithMostPosts,
  getUsersWithHighestRatings
} = require('../controllers/search.controller');

// GET /api/search/keyword - Search messages and replies by keyword
router.get('/keyword', searchByKeyword);

// GET /api/search/user - Search users by username
router.get('/user', searchByUsername);

// GET /api/search/users/most-posts - Get users with most posts
router.get('/users/most-posts', getUsersWithMostPosts);

// GET /api/search/users/highest-ratings - Get users with highest average ratings
router.get('/users/highest-ratings', getUsersWithHighestRatings);

module.exports = router; 