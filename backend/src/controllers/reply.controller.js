const db = require('../models');
const Reply = db.Reply;
const User = db.User;
const Message = db.Message;
const Rating = db.Rating;
const { Op } = db.Sequelize;

// Create a new reply
exports.createReply = async (req, res) => {
  try {
    // Validate request
    if (!req.body.content || !req.body.messageId) {
      return res.status(400).json({
        message: 'Content and messageId are required!'
      });
    }

    // Check if message exists
    const message = await Message.findByPk(req.body.messageId);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found!'
      });
    }

    // If parentReplyId is provided, check if parent reply exists
    if (req.body.parentReplyId) {
      const parentReply = await Reply.findByPk(req.body.parentReplyId);
      if (!parentReply) {
        return res.status(404).json({
          message: 'Parent reply not found!'
        });
      }
    }

    // Create reply
    const reply = await Reply.create({
      content: req.body.content,
      userId: req.userId,
      messageId: req.body.messageId,
      parentReplyId: req.body.parentReplyId || null,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null
    });

    // Fetch the newly created reply with author details
    const createdReply = await Reply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'level']
        }
      ]
    });

    res.status(201).json({
      message: 'Reply created successfully!',
      reply: createdReply
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error creating reply'
    });
  }
};

// Get all replies for a message
exports.getRepliesByMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;

    // Check if message exists
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found!'
      });
    }

    // Get top-level replies (ones without a parent reply)
    const replies = await Reply.findAll({
      where: { 
        messageId,
        parentReplyId: null
      },
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
        },
        {
          model: Reply,
          as: 'childReplies',
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
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Calculate rating totals for each reply
    const repliesWithRatings = replies.map(reply => {
      const replyData = reply.toJSON();
      replyData.totalRating = reply.ratings.reduce((sum, rating) => sum + rating.value, 0);
      
      // Calculate ratings for child replies
      if (replyData.childReplies && replyData.childReplies.length > 0) {
        replyData.childReplies = replyData.childReplies.map(childReply => {
          childReply.totalRating = childReply.ratings.reduce((sum, rating) => sum + rating.value, 0);
          return childReply;
        });
      }
      
      return replyData;
    });

    res.status(200).json(repliesWithRatings);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving replies'
    });
  }
};

// Get child replies for a parent reply
exports.getChildReplies = async (req, res) => {
  try {
    const parentReplyId = req.params.replyId;

    // Check if parent reply exists
    const parentReply = await Reply.findByPk(parentReplyId);
    if (!parentReply) {
      return res.status(404).json({
        message: 'Parent reply not found!'
      });
    }

    // Get child replies
    const replies = await Reply.findAll({
      where: { parentReplyId },
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
      order: [['createdAt', 'ASC']]
    });

    // Calculate rating totals for each reply
    const repliesWithRatings = replies.map(reply => {
      const replyData = reply.toJSON();
      replyData.totalRating = reply.ratings.reduce((sum, rating) => sum + rating.value, 0);
      return replyData;
    });

    res.status(200).json(repliesWithRatings);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving replies'
    });
  }
};

// Update a reply
exports.updateReply = async (req, res) => {
  try {
    const reply = await Reply.findByPk(req.params.id);

    if (!reply) {
      return res.status(404).json({
        message: 'Reply not found!'
      });
    }

    // Check if user is reply owner or admin
    const user = await User.findByPk(req.userId);

    if (reply.userId !== req.userId && !user.isAdmin) {
      return res.status(403).json({
        message: 'You are not authorized to update this reply!'
      });
    }

    // Update reply
    await reply.update({
      content: req.body.content || reply.content,
      screenshot: req.file ? `/uploads/${req.file.filename}` : reply.screenshot
    });

    res.status(200).json({
      message: 'Reply updated successfully!',
      reply
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating reply'
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findByPk(req.params.id);

    if (!reply) {
      return res.status(404).json({
        message: 'Reply not found!'
      });
    }

    // Delete reply
    await reply.destroy();

    res.status(200).json({
      message: 'Reply deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error deleting reply'
    });
  }
};

// Rate a reply
exports.rateReply = async (req, res) => {
  try {
    // Validate request
    if (req.body.value !== 1 && req.body.value !== -1) {
      return res.status(400).json({
        message: 'Rating value must be 1 (upvote) or -1 (downvote)!'
      });
    }

    // Check if reply exists
    const reply = await Reply.findByPk(req.params.id);
    if (!reply) {
      return res.status(404).json({
        message: 'Reply not found!'
      });
    }

    // Check if user has already rated this reply
    const existingRating = await Rating.findOne({
      where: {
        userId: req.userId,
        targetType: 'reply',
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
        targetType: 'reply',
        targetId: req.params.id
      });

      res.status(201).json({
        message: 'Rating created successfully!',
        rating
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error rating reply'
    });
  }
};

// Get all replies (admin only)
exports.getAllReplies = async (req, res) => {
  try {
    const replies = await Reply.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Message,
          as: 'message',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving replies'
    });
  }
}; 