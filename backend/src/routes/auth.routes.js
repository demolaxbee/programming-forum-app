const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - User login
router.post('/login', login);

module.exports = router; 