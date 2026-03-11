const express = require('express');
const router = express.Router();
const { authenticate, requireHospitalAccess, enforceHospitalScope } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// Apply basic hospital access middleware
router.use(authenticate);

// Predict wait time for a doctor
router.get('/predict', aiController.predictWaitTime);

// Get doctor recommendations for a department
router.get('/recommend', aiController.getRecommendations);

// Get a proactive quick suggestion
router.get('/quick-suggestion', aiController.getQuickSuggestion);

module.exports = router;
