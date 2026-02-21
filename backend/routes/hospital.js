const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess 
} = require('../middleware/auth');
const hospitalController = require('../controllers/hospitalController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);

// Get hospital profile for logged-in admin
router.get('/profile', requireHospitalAdmin, hospitalController.getHospitalProfile);

// Update hospital profile
router.put('/profile', requireHospitalAdmin, hospitalController.updateHospitalProfile);

// Get hospital departments
router.get('/departments', requireHospitalAdmin, hospitalController.getDepartments);

// Add new department
router.post('/departments', requireHospitalAdmin, hospitalController.addDepartment);

// Update department
router.put('/departments/:departmentId', requireHospitalAdmin, hospitalController.updateDepartment);

module.exports = router;