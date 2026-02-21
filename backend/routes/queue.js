const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');
const queueController = require('../controllers/queueController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// Get queue list with filters
router.get('/', requireHospitalAdmin, queueController.getQueueList);

// Get single queue entry details
router.get('/:queueId', requireHospitalAdmin, queueController.getQueueEntry);

// Create new queue entry
router.post('/', requireHospitalAdmin, queueController.createQueueEntry);

// Update queue status
router.put('/:queueId/status', requireHospitalAdmin, queueController.updateQueueStatus);

// Update queue entry
router.put('/:queueId', requireHospitalAdmin, queueController.updateQueueEntry);

// Cancel queue entry
router.delete('/:queueId', requireHospitalAdmin, queueController.deleteQueueEntry);

module.exports = router;