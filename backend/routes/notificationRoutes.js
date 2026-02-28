const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(authenticate);

// Get all notifications for a patient
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      patientId: req.user.role === 'patient' ? req.user._id : req.query.patientId 
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json({ success: true, data: notifications });
  } catch (error) {
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

module.exports = router;
