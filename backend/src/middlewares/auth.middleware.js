const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({
      message: 'No token provided!'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized!'
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }
    
    if (user.isAdmin) {
      next();
      return;
    }

    res.status(403).json({
      message: 'Admin role required!'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error checking admin role'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
}; 