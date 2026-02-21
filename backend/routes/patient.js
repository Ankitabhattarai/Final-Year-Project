const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');
const patientController = require('../controllers/patientController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// Get all patients for hospital
router.get('/', requireHospitalAdmin, patientController.getPatients);

// Create new patient
router.post('/', requireHospitalAdmin, patientController.createPatient);

module.exports = router;
