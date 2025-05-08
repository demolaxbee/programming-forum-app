const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const {
  createChannel,
  getAllChannels,
  getChannelById,
  updateChannel,
  deleteChannel
} = require('../controllers/channel.controller');

// GET /api/channels - Get all channels
router.get('/', getAllChannels);

// GET /api/channels/:id - Get a specific channel
router.get('/:id', getChannelById);

// POST /api/channels - Create a new channel (requires authentication)
router.post('/', verifyToken, createChannel);

// PUT /api/channels/:id - Update a channel (requires authentication)
router.put('/:id', verifyToken, updateChannel);

// DELETE /api/channels/:id - Delete a channel (requires admin)
router.delete('/:id', [verifyToken, isAdmin], deleteChannel);

module.exports = router; 