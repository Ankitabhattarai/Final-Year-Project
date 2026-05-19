const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendTurnNotificationEmail } = require('../utils/emailUtils');
const { sendSocketNotification } = require('../utils/socket');

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
      $or: [
        { status: { $in: ['waiting', 'in_progress'] } },
        {
          status: { $in: ['completed', 'no_show'] },
          $or: [
            { scheduledTime: { $gte: today, $lt: tomorrow } },
            { completedTime: { $gte: today, $lt: tomorrow } }
          ]
        }
      ]
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
      
      // Calculate actual wait time from scheduled time
      const currentQueue = await Queue.findById(queueId);
      if (currentQueue && currentQueue.scheduledTime) {
        const scheduledTime = new Date(currentQueue.scheduledTime);
        const waitTimeMinutes = Math.round((updateData.calledTime - scheduledTime) / (1000 * 60));
        updateData.actualWaitTime = Math.max(0, waitTimeMinutes);
      }
    } else if (status === 'completed') {
      updateData.completedTime = new Date();
      
      // Calculate consultation duration if we have calledTime
      const currentQueue = await Queue.findById(queueId);
      if (currentQueue && currentQueue.calledTime) {
        updateData.consultationTime = Math.round((updateData.completedTime - currentQueue.calledTime) / (1000 * 60));
      }
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

    // Notify the NEXT patient in the queue if a turn just started
    console.log('--- Notification Trigger Check ---');
    console.log('Status updated to:', status);
    
    if (status === 'in_progress') {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        console.log('Searching for next patient for doctor:', doctorId, '(from req.user:', req.user._id, ')');
        console.log('Query start time:', todayStart);

        const nextPatient = await Queue.findOne({
          doctorId,
          status: 'waiting'
        }).sort({ scheduledTime: 1, priority: -1 })
          .populate('patientId', 'fullName email')
          .populate('hospitalId', 'name');

        console.log('Next patient query result:', nextPatient ? {
          token: nextPatient.tokenNumber,
          patientId: nextPatient.patientId?._id,
          patientExists: !!nextPatient.patientId,
          email: nextPatient.patientId?.email
        } : 'NOT FOUND');

        if (nextPatient && nextPatient.patientId) {
          const patientId = nextPatient.patientId._id;
          const hospitalName = nextPatient.hospitalId.name;
          const doctorName = req.user.fullName;
          const tokenNumber = nextPatient.tokenNumber;

          console.log(`Creating notification for ${nextPatient.patientId.fullName} (Token: ${tokenNumber})`);

          // 1. Save in-app notification
          const notification = new Notification({
            patientId,
            hospitalId: nextPatient.hospitalId._id,
            title: 'Your turn is coming up!',
            message: `Hello ${nextPatient.patientId.fullName}, you are next in line for ${doctorName}. Please be ready.`,
            type: 'turn_alert'
          });
          await notification.save();
          console.log('Notification saved to DB:', notification._id);

          // 2. Send socket notification
          const targetUser = await User.findOne({ email: nextPatient.patientId.email });
          if (targetUser) {
            console.log('Found target user for socket:', targetUser._id);
            sendSocketNotification(targetUser._id, {
              id: notification._id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              createdAt: notification.createdAt
            });
          } else {
            console.warn('Could not find user record for next patient email:', nextPatient.patientId.email);
          }

          // 3. Send Email alert
          if (nextPatient.patientId.email) {
            console.log('Sending email to:', nextPatient.patientId.email);
            await sendTurnNotificationEmail(
              nextPatient.patientId.email,
              hospitalName,
              doctorName,
              tokenNumber
            );
          }
        } else {
          console.log('No eligible next patient found in queue to notify.');
        }
      } catch (notifyError) {
        console.error('Notification trigger error:', notifyError);
      }
    }
    console.log('--- End Notification Check ---');

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
          $or: [
            { status: { $in: ['waiting', 'in_progress'] } },
            {
              status: { $in: ['completed', 'no_show'] },
              $or: [
                { scheduledTime: { $gte: today, $lt: tomorrow } },
                { completedTime: { $gte: today, $lt: tomorrow } }
              ]
            }
          ]
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
