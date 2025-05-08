const db = require('../models');
const Message = db.Message;
const User = db.User;
const Reply = db.Reply;
const Rating = db.Rating;
const Channel = db.Channel;
const { Op } = db.Sequelize;

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.content || !req.body.channelId) {
      return res.status(400).json({
        message: 'Title, content, and channelId are required!'
      });
    }

    // Check if channel exists
    const channel = await Channel.findByPk(req.body.channelId);
    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found!'
      });
    }

    // Create message
    const message = await Message.create({
      title: req.body.title,
      content: req.body.content,
      userId: req.userId,
      channelId: req.body.channelId,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null,
      tags: req.body.tags ? req.body.tags.split(',') : []
    });

    res.status(201).json({
      message: 'Message created successfully!',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error creating message'
    });
  }
};

// Get all messages for a channel
exports.getMessagesByChannel = async (req, res) => {
  try {
    const channelId = req.params.channelId;

    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found!'
      });
    }

    // Get messages
    const messages = await Message.findAll({
      where: { channelId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'level']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'value', 'userId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate rating totals for each message
    const messagesWithRatings = messages.map(message => {
      const msg = message.toJSON();
      msg.totalRating = message.ratings.reduce((sum, rating) => sum + rating.value, 0);
      return msg;
    });

    res.status(200).json(messagesWithRatings);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving messages'
    });
  }
};

// controller/message.controller.js or wherever you define exports.getMessageById

// Recursive helper to get nested child replies
async function buildReplyTree(reply) {
  const childReplies = await Reply.findAll({
    where: { parentReplyId: reply.id },
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar', 'level'] },
      { model: Rating, as: 'ratings', attributes: ['id', 'value', 'userId'] }
    ]
  });

  for (const child of childReplies) {
    child.dataValues.totalRating = (child.ratings || []).reduce((sum, r) => sum + r.value, 0);
    child.dataValues.childReplies = await buildReplyTree(child);
  }

  return childReplies;
}

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'level']
        },
        {
          model: Channel,
          as: 'channel',
          attributes: ['id', 'name']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'value', 'userId']
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found!' });
    }

    const result = message.toJSON();
    result.totalRating = (message.ratings || []).reduce((sum, r) => sum + r.value, 0);

    // Fetch top-level replies
    const topReplies = await Reply.findAll({
      where: {
        messageId: req.params.id,
        parentReplyId: null
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar', 'level'] },
        { model: Rating, as: 'ratings', attributes: ['id', 'value', 'userId'] }
      ]
    });

    // Recursively load nested replies
    for (const reply of topReplies) {
      reply.dataValues.totalRating = (reply.ratings || []).reduce((sum, r) => sum + r.value, 0);
      reply.dataValues.childReplies = await buildReplyTree(reply);
    }

    result.replies = topReplies;

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};


// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found!'
      });
    }

    // Check if user is message owner or admin
    const user = await User.findByPk(req.userId);

    if (message.userId !== req.userId && !user.isAdmin) {
      return res.status(403).json({
        message: 'You are not authorized to update this message!'
      });
    }

    // Update message
    await message.update({
      title: req.body.title || message.title,
      content: req.body.content || message.content,
      screenshot: req.file ? `/uploads/${req.file.filename}` : message.screenshot,
      tags: req.body.tags ? req.body.tags.split(',') : message.tags
    });

    res.status(200).json({
      message: 'Message updated successfully!',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating message'
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found!'
      });
    }

    // Check if user is message owner or admin
    const user = await User.findByPk(req.userId);

    if (message.userId !== req.userId && !user.isAdmin) {
      return res.status(403).json({
        message: 'You are not authorized to delete this message!'
      });
    }

    // Delete message
    await message.destroy();

    res.status(200).json({
      message: 'Message deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error deleting message'
    });
  }
};

// Rate a message
exports.rateMessage = async (req, res) => {
  try {
    // Validate request
    if (req.body.value !== 1 && req.body.value !== -1) {
      return res.status(400).json({
        message: 'Rating value must be 1 (upvote) or -1 (downvote)!'
      });
    }

    // Check if message exists
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found!'
      });
    }

    // Check if user has already rated this message
    const existingRating = await Rating.findOne({
      where: {
        userId: req.userId,
        targetType: 'message',
        targetId: req.params.id
      }
    });

    if (existingRating) {
      // Update existing rating
      await existingRating.update({
        value: req.body.value
      });

      res.status(200).json({
        message: 'Rating updated successfully!',
        rating: existingRating
      });
    } else {
      // Create new rating
      const rating = await Rating.create({
        value: req.body.value,
        userId: req.userId,
        targetType: 'message',
        targetId: req.params.id
      });

      res.status(201).json({
        message: 'Rating created successfully!',
        rating
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error rating message'
    });
  }
};

// Get all messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Channel,
          as: 'channel',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving messages'
    });
  }
}; 