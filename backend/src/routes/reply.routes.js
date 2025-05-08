const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  createReply,
  getRepliesByMessage,
  getChildReplies,
  updateReply,
  deleteReply,
  rateReply,
  getAllReplies
} = require('../controllers/reply.controller');

// GET /api/replies - Get all replies (admin only)
router.get('/', [verifyToken, isAdmin], getAllReplies);

// GET /api/replies/message/:messageId - Get all replies for a message
router.get('/message/:messageId', getRepliesByMessage);

// GET /api/replies/parent/:replyId - Get child replies
router.get('/parent/:replyId', getChildReplies);

// POST /api/replies - Create a new reply
router.post('/', [verifyToken, upload.single('screenshot')], createReply);

// PUT /api/replies/:id - Update a reply
router.put('/:id', [verifyToken, upload.single('screenshot')], updateReply);

// DELETE /api/replies/:id - Delete a reply
router.delete('/:id', [verifyToken, isAdmin], deleteReply);

// POST /api/replies/:id/rate - Rate a reply
router.post('/:id/rate', verifyToken, rateReply);

module.exports = router; 