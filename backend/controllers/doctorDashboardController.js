const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const User = require('../models/User');

/**
 * Handles doctor dashboard data fetching and status updates
 */

// Fetch today's queue for the logged-in doctor
exports.getMyQueue = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queueEntries = await Queue.find({
      doctorId,
      scheduledTime: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] }
    })
    .populate('patientId', 'fullName phone patientId')
    .sort({ scheduledTime: 1, priority: -1 });

    res.json({
      success: true,
      data: queueEntries
    });
  } catch (error) {
    console.error('Get doctor queue error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your queue' });
  }
};

// Update patient status in the queue
exports.updatePatientStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { queueId } = req.params;
    const doctorId = req.user._id;

    if (!['waiting', 'in_progress', 'completed', 'no_show', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'in_progress') {
      updateData.calledTime = new Date();
    } else if (status === 'completed') {
      updateData.completedTime = new Date();
    }
    if (notes) updateData.notes = notes;

    const queueEntry = await Queue.findOneAndUpdate(
      { _id: queueId, doctorId },
      updateData,
      { new: true }
    ).populate('patientId', 'fullName patientId');

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: 'Queue entry not found or not assigned to you' });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: queueEntry
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// Calculate session statistics and trends
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Queue.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          scheduledTime: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalPatientsToday: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
          },
          waiting: { 
            $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] } 
          },
          inProgress: { 
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } 
          },
          noShow: { 
            $sum: { $cond: [{ $eq: ["$status", "no_show"] }, 1, 0] } 
          }
        }
      }
    ]);

    const result = stats[0] || { totalPatientsToday: 0, completed: 0, waiting: 0, inProgress: 0, noShow: 0 };

    // Generate 7-day volume trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trend = await Queue.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          scheduledTime: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledTime" } },
          patients: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const finalTrend = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = trend.find(t => t._id === dateStr);
      finalTrend.push({
        day: dayLabel,
        patients: dayData ? dayData.patients : 0,
        fullDate: dateStr
      });
    }

    res.json({
      success: true,
      data: {
        ...result,
        weeklyTrend: finalTrend
      }
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};
