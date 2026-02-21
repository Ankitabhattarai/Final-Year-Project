const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/signup', authController.register);

// Login user
router.post('/login', authController.login);

// Login hospital admin with hospital verification
router.post('/hospital-admin-login', authController.hospitalAdminLogin);

module.exports = router;