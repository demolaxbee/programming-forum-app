const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email already in use!'
      });
    }

    // Create new user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      avatar: req.body.avatar,
      level: req.body.level || 'Beginner',
      isAdmin: false // Default is not admin
    });

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        avatar: user.avatar
      },
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error registering user'
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid password!'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      },
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error during login'
    });
  }
}; 