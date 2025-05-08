const db = require('../models');
const Channel = db.Channel;
const User = db.User;

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).json({
        message: 'Channel name is required!'
      });
    }

    // Create channel
    const channel = await Channel.create({
      name: req.body.name,
      description: req.body.description,
      userId: req.userId // Set from the auth middleware
    });

    res.status(201).json({
      message: 'Channel created successfully!',
      channel
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error creating channel'
    });
  }
};

// Get all channels
exports.getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(200).json(channels);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving channels'
    });
  }
};

// Get a specific channel by ID
exports.getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found!'
      });
    }

    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving channel'
    });
  }
};

// Update a channel
exports.updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found!'
      });
    }

    // Check if user is channel owner or admin
    const user = await User.findByPk(req.userId);

    if (channel.userId !== req.userId && !user.isAdmin) {
      return res.status(403).json({
        message: 'You are not authorized to update this channel!'
      });
    }

    // Update channel
    await channel.update({
      name: req.body.name || channel.name,
      description: req.body.description || channel.description
    });

    res.status(200).json({
      message: 'Channel updated successfully!',
      channel
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating channel'
    });
  }
};

// Delete a channel (admin only)
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found!'
      });
    }

    // Delete channel
    await channel.destroy();

    res.status(200).json({
      message: 'Channel deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error deleting channel'
    });
  }
}; 