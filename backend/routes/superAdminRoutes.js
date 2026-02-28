const express = require('express');
const router = express.Router();
const { authenticate, requireSystemAdmin } = require('../middleware/auth');
const superAdminController = require('../controllers/superAdminController');

// All routes here are restricted to 'admin' role
router.use(authenticate);
router.use(requireSystemAdmin);

// Hospital Management
router.get('/hospitals', superAdminController.getAllHospitals);
router.get('/hospitals/pending', superAdminController.getPendingHospitals);
router.put('/hospitals/:id/status', superAdminController.processHospitalRequest);

// Patient Management
router.get('/patients', superAdminController.getAllPatients);

// System Analytics
router.get('/stats', superAdminController.getSystemStats);

module.exports = router;
