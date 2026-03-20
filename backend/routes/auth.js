const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/signup', authController.register);

// Login user
router.post('/login', authController.login);

// Login hospital admin with hospital verification
router.post('/hospital-admin-login', authController.hospitalAdminLogin);

// Change password
router.put('/change-password', authenticate, authController.changePassword);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.put('/reset-password/:token', authController.resetPassword);

// Google Sign-In
router.post('/google', authController.googleSignIn);

module.exports = router;