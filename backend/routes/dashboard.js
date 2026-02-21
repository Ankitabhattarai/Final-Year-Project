const express = require('express');
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Apply authentication and hospital access middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// Get dashboard metrics for hospital admin
router.get('/metrics', requireHospitalAdmin, dashboardController.getDashboardMetrics);

// Get patient flow analytics for charts
router.get('/patient-flow', requireHospitalAdmin, dashboardController.getPatientFlow);

// Get department-wise wait time analytics
router.get('/department-wait-times', requireHospitalAdmin, dashboardController.getDepartmentWaitTimes);

// Get real-time queue status
router.get('/queue-status', requireHospitalAdmin, dashboardController.getQueueStatus);

module.exports = router;