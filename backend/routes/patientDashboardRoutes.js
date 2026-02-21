const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const patientDashboardController = require('../controllers/patientDashboardController');

// All patient dashboard routes require authentication
router.use(authenticate);

// Middleware to ensure user is a patient
const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ success: false, message: 'Access denied. Patient role required.' });
  }
  next();
};

router.use(requirePatient);

// Routes
router.get('/hospitals', patientDashboardController.getHospitals);
router.get('/hospitals/:hospitalId/departments', patientDashboardController.getHospitalDepartments);
router.get('/hospitals/:hospitalId/departments/:deptName/doctors', patientDashboardController.getAvailableDoctors);
router.get('/my-queue', patientDashboardController.getMyQueue);
router.post('/book-token', patientDashboardController.bookToken);

module.exports = router;
