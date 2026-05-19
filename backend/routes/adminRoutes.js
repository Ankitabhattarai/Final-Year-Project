const express = require('express');
const router = express.Router();
const { authenticate, requireHospitalAdmin, requireHospitalAccess } = require('../middleware/auth');
const adminUserController = require('../controllers/adminUserController');
const adminHospitalController = require('../controllers/adminHospitalController');

// All routes require authentication, hospital admin role, and active hospital access
router.use(authenticate);
router.use(requireHospitalAdmin);
router.use(requireHospitalAccess);

// *** USERS ***
router.get('/users', adminUserController.getAllUsers);
router.post('/users', adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);

// *** HOSPITALS ***
router.get('/hospitals', adminHospitalController.getAllHospitals);
router.post('/hospitals', adminHospitalController.createHospital);
router.put('/hospitals/:id', adminHospitalController.updateHospital);
router.delete('/hospitals/:id', adminHospitalController.deleteHospital);

// *** DEPARTMENTS ***
router.get('/departments', adminHospitalController.getAllDepartments);
router.post('/departments', adminHospitalController.addDepartment);
router.put('/departments/:hospitalId/:deptId', adminHospitalController.updateDepartment);
router.delete('/departments/:hospitalId/:deptId', adminHospitalController.deleteDepartment);

module.exports = router;
