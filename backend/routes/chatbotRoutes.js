const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');

router.post('/chat', authenticate, chatbotController.getChatResponse);

module.exports = router;
