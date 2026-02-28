const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// Get summary report for date range
router.get('/summary', requireHospitalAdmin, reportsController.getSummaryReport);

// Get detailed report with all appointments
router.get('/detailed', requireHospitalAdmin, reportsController.getDetailedReport);

// Get doctor performance report
router.get('/doctor-performance', requireHospitalAdmin, reportsController.getDoctorPerformance);

// Export report data as CSV
router.get('/export/csv', requireHospitalAdmin, reportsController.exportReport);

// Get advanced analytics
router.get('/analytics', requireHospitalAdmin, reportsController.getAnalytics);

module.exports = router;