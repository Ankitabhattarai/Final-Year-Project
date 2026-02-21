const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const doctorDashboardController = require('../controllers/doctorDashboardController');

// All doctor dashboard routes require authentication
router.use(authenticate);

// Middleware to ensure user is a doctor
const requireDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
  }
  next();
};

router.use(requireDoctor);

// Routes
router.get('/my-queue', doctorDashboardController.getMyQueue);
router.get('/stats', doctorDashboardController.getDoctorStats);
router.put('/queue/:queueId/status', doctorDashboardController.updatePatientStatus);

module.exports = router;
