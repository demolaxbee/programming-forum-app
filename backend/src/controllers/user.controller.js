const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;
const Message = db.Message;
const Reply = db.Reply;
const Rating = db.Rating;
const { Op, Sequelize } = db.Sequelize;

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'avatar', 'level', 'isAdmin', 'createdAt', 'updatedAt']
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving users'
    });
  }
};

// Get current user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'username', 'email', 'avatar', 'level', 'isAdmin', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }

    // Get user's post counts
    const messageCount = await Message.count({
      where: { userId: req.userId }
    });

    const replyCount = await Reply.count({
      where: { userId: req.userId }
    });

    // Get average rating for user's content
    const ratings = await Rating.findAll({
      where: {
        [Op.or]: [
          {
            targetType: 'message',
            targetId: {
              [Op.in]: Sequelize.literal(`(SELECT id FROM Messages WHERE userId = ${req.userId})`)
            }
          },
          {
            targetType: 'reply',
            targetId: {
              [Op.in]: Sequelize.literal(`(SELECT id FROM Replies WHERE userId = ${req.userId})`)
            }
          }
        ]
      },
      attributes: ['value']
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.value, 0) / totalRatings 
      : 0;

    res.status(200).json({
      ...user.toJSON(),
      stats: {
        messageCount,
        replyCount,
        totalPosts: messageCount + replyCount,
        totalRatings,
        averageRating
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving user profile'
    });
  }
};

// Update current user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }

    // Update user details
    const updates = {
      username: req.body.username || user.username,
      email: req.body.email || user.email,
      level: req.body.level || user.level,
      avatar: req.file ? `/uploads/${req.file.filename}` : user.avatar
    };

    // If password is provided, hash it
    if (req.body.password) {
      updates.password = bcrypt.hashSync(req.body.password, 8);
    }

    // Check if username is being changed and is unique
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: req.body.username }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Username already in use!'
        });
      }
    }

    // Check if email is being changed and is unique
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: req.body.email }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use!'
        });
      }
    }

    await user.update(updates);

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating profile'
    });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete an admin user!' });
    }

    // Anonymize instead of delete
    await user.update({
      username: `Deleted User ${user.id}`,
      email: `deleted_${user.id}_${Date.now()}@deleted.com`,
      avatar: null,
      password: '',
      level: 'Beginner'
    });

    res.status(200).json({ message: 'User anonymized successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error anonymizing user' });
  }
};
