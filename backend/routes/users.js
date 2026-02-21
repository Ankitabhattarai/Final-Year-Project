const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');
const userController = require('../controllers/userController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// Get all users for hospital (doctors, staff)
router.get('/', requireHospitalAdmin, userController.getUsers);

// Get single user details
router.get('/:userId', requireHospitalAdmin, userController.getUserById);

// Create new user (doctor/staff)
router.post('/', requireHospitalAdmin, userController.createUser);

// Update user
router.put('/:userId', requireHospitalAdmin, userController.updateUser);

// Deactivate user (soft delete)
router.delete('/:userId', requireHospitalAdmin, userController.deactivateUser);

// Reset user password
router.put('/:userId/password', requireHospitalAdmin, userController.resetPassword);

module.exports = router;