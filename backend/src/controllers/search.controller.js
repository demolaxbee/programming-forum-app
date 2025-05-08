const db = require('../models');
const Message = db.Message;
const Reply = db.Reply;
const User = db.User;
const Channel = db.Channel;
const Rating = db.Rating;
const { Op, Sequelize } = db.Sequelize;

// Search messages, replies, and channels by keyword
exports.searchByKeyword = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }


    // Search channels (including creator.username)
    const channels = await Channel.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
          where: {
            username: { [Op.like]: `%${query}%` }
          },
          required: false // Important: include channels even if creator.username doesn't match
        }
      ],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: parseInt(limit)
    });


    // Search messages
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } },
          { tags: { [Op.like]: `%${query}%` } }
        ]
      },
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
        }
      ],
      limit: parseInt(limit)
    });

    // Search replies
    const replies = await Reply.findAll({
      where: {
        content: { [Op.like]: `%${query}%` }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'level']
        },
        {
          model: Message,
          as: 'message',
          attributes: ['id', 'title'],
          include: [
            {
              model: Channel,
              as: 'channel',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      limit: parseInt(limit)
    });


    // Search users
    const users = await User.findAll({
      where: {
        username: { [Op.like]: `%${query}%` },
        email: { [Op.notLike]: '%@deleted.com' }  // exclude deleted users
      },
      attributes: ['id', 'username', 'avatar', 'level', 'createdAt'],
      limit: parseInt(limit)
    });


    res.status(200).json({
      channels,
      messages,
      replies, 
      users
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error performing search'
    });
  }
};


// Search users by username
exports.searchByUsername = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const users = await User.findAll({
      where: {
        username: { [Op.like]: `%${query}%` },
        email: { [Op.notLike]: '%@deleted.com' }
      },
      attributes: ['id', 'username', 'avatar', 'level', 'createdAt'],
      limit: parseInt(limit)
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error searching users'
    });
  }
};

// Get users with most posts
exports.getUsersWithMostPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get users with most messages and replies combined
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'avatar', 
        'level',
        [Sequelize.literal(`(
          SELECT COUNT(*) FROM Messages WHERE Messages.userId = User.id
        )`), 'messageCount'],
        [Sequelize.literal(`(
          SELECT COUNT(*) FROM Replies WHERE Replies.userId = User.id
        )`), 'replyCount'],
        [Sequelize.literal(`(
          SELECT COUNT(*) FROM Messages WHERE Messages.userId = User.id
        ) + (
          SELECT COUNT(*) FROM Replies WHERE Replies.userId = User.id
        )`), 'totalPosts']
      ],
      order: [[Sequelize.literal('totalPosts'), 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error getting users with most posts'
    });
  }
};

// Get users with highest average ratings
exports.getUsersWithHighestRatings = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Custom SQL query to get users with average ratings on their content
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'avatar', 
        'level',
        [Sequelize.literal(`(
          SELECT COALESCE(AVG(r.value), 0)
          FROM Ratings r
          WHERE (r.targetType = 'message' AND r.targetId IN (
            SELECT id FROM Messages WHERE userId = User.id
          )) OR (r.targetType = 'reply' AND r.targetId IN (
            SELECT id FROM Replies WHERE userId = User.id
          ))
        )`), 'averageRating'],
        [Sequelize.literal(`(
          SELECT COUNT(*)
          FROM Ratings r
          WHERE (r.targetType = 'message' AND r.targetId IN (
            SELECT id FROM Messages WHERE userId = User.id
          )) OR (r.targetType = 'reply' AND r.targetId IN (
            SELECT id FROM Replies WHERE userId = User.id
          ))
        )`), 'ratingCount']
      ],
      having: Sequelize.literal('ratingCount > 0'),
      order: [[Sequelize.literal('averageRating'), 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error getting users with highest ratings'
    });
  }
}; 