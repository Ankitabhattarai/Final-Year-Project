const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    let query;

    if (req.user.role === 'patient') {
      // Find all patient records (at different hospitals) linked to this user's email
      const patientRecords = await Patient.find({ email: req.user.email });
      
      if (!patientRecords || patientRecords.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Map to an array of patient IDs
      const patientIds = patientRecords.map(p => p._id);
      query = { patientId: { $in: patientIds } };
    } else {
      // For hospital admins or doctors, they might fetch for a specific patient via query
      if (!req.query.patientId) {
        return res.status(400).json({ success: false, message: 'patientId is required' });
      }
      query = { patientId: req.query.patientId };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

// Mark all as read
router.put('/mark-all-read', async (req, res) => {
  try {
    let query;
    if (req.user.role === 'patient') {
      const patientRecords = await Patient.find({ email: req.user.email });
      if (!patientRecords || patientRecords.length === 0) {
        return res.json({ success: true, message: 'No notifications to mark' });
      }
      const patientIds = patientRecords.map(p => p._id);
      query = { patientId: { $in: patientIds }, isRead: false };
    } else {
      query = { patientId: req.body.patientId, isRead: false };
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
});

module.exports = router;
