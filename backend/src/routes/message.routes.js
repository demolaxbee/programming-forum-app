const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  createMessage,
  getMessagesByChannel,
  getMessageById,
  updateMessage,
  deleteMessage,
  rateMessage,
  getAllMessages
} = require('../controllers/message.controller');

// GET /api/messages - Get all messages (admin only)
router.get('/', [verifyToken, isAdmin], getAllMessages);

// GET /api/messages/channel/:channelId - Get all messages for a channel
router.get('/channel/:channelId', getMessagesByChannel);

// GET /api/messages/:id - Get message by ID
router.get('/:id', getMessageById);

// POST /api/messages - Create a new message
router.post('/', [verifyToken, upload.single('screenshot')], createMessage);

// PUT /api/messages/:id - Update a message
router.put('/:id', [verifyToken, upload.single('screenshot')], updateMessage);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', [verifyToken, isAdmin], deleteMessage);

// POST /api/messages/:id/rate - Rate a message
router.post('/:id/rate', verifyToken, rateMessage);

module.exports = router; 