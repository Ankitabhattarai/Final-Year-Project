const express = require('express');
const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication and hospital access middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// @route   GET /api/dashboard/metrics
// @desc    Get dashboard metrics for hospital admin
// @access  Private (Hospital Admin)
router.get('/metrics', requireHospitalAdmin, async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total patients today
    const totalPatientsToday = await Queue.countDocuments({
      hospitalId,
      scheduledTime: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    });

    // Get average wait time today
    const waitTimeStats = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: today, $lt: tomorrow },
          actualWaitTime: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: '$actualWaitTime' },
          totalCompleted: { $sum: 1 }
        }
      }
    ]);

    const avgWaitTime = waitTimeStats.length > 0 ? Math.round(waitTimeStats[0].avgWaitTime) : 0;

    // Get active queues count
    const activeQueues = await Queue.countDocuments({
      hospitalId,
      status: { $in: ['waiting', 'in_progress'] },
      scheduledTime: { $gte: today, $lt: tomorrow }
    });

    // Get doctor availability
    const totalDoctors = await User.countDocuments({
      hospitalId,
      role: 'doctor',
      isActive: true
    });

    const availableDoctors = await User.countDocuments({
      hospitalId,
      role: 'doctor',
      isActive: true,
      'employeeDetails.isActive': true
    });

    const doctorAvailability = totalDoctors > 0 ? Math.round((availableDoctors / totalDoctors) * 100) : 0;

    // Get yesterday's data for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayPatients = await Queue.countDocuments({
      hospitalId,
      scheduledTime: { $gte: yesterday, $lt: today },
      status: { $ne: 'cancelled' }
    });

    const patientsChange = yesterdayPatients > 0 
      ? Math.round(((totalPatientsToday - yesterdayPatients) / yesterdayPatients) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalPatientsToday: {
          value: totalPatientsToday,
          change: patientsChange,
          changeText: `${Math.abs(patientsChange)}% ${patientsChange >= 0 ? 'from' : 'less than'} yesterday`
        },
        avgWaitTime: {
          value: avgWaitTime,
          unit: 'minutes',
          changeText: 'Based on completed appointments'
        },
        activeQueues: {
          value: activeQueues,
          changeText: 'Currently active'
        },
        doctorAvailability: {
          value: doctorAvailability,
          unit: 'percent',
          changeText: `${availableDoctors} of ${totalDoctors} doctors available`
        }
      }
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics'
    });
  }
});

// @route   GET /api/dashboard/patient-flow
// @desc    Get patient flow analytics for charts
// @access  Private (Hospital Admin)
router.get('/patient-flow', requireHospitalAdmin, async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const { period = '7days' } = req.query;
    
    let startDate = new Date();
    let groupBy = {};
    
    // Set date range based on period
    switch (period) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        groupBy = {
          year: { $year: '$scheduledTime' },
          month: { $month: '$scheduledTime' },
          day: { $dayOfMonth: '$scheduledTime' },
          hour: { $hour: '$scheduledTime' }
        };
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          year: { $year: '$scheduledTime' },
          month: { $month: '$scheduledTime' },
          day: { $dayOfMonth: '$scheduledTime' }
        };
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          year: { $year: '$scheduledTime' },
          month: { $month: '$scheduledTime' },
          day: { $dayOfMonth: '$scheduledTime' }
        };
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          year: { $year: '$scheduledTime' },
          month: { $month: '$scheduledTime' },
          day: { $dayOfMonth: '$scheduledTime' }
        };
    }

    const patientFlow = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          scheduled: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [{ $in: ['$status', ['completed', 'in_progress']] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          noShow: {
            $sum: {
              $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        patientFlow
      }
    });

  } catch (error) {
    console.error('Patient flow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient flow data'
    });
  }
});

// @route   GET /api/dashboard/department-wait-times
// @desc    Get department-wise wait time analytics
// @access  Private (Hospital Admin)
router.get('/department-wait-times', requireHospitalAdmin, async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const departmentWaitTimes = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: today, $lt: tomorrow },
          actualWaitTime: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$department',
          avgWaitTime: { $avg: '$actualWaitTime' },
          minWaitTime: { $min: '$actualWaitTime' },
          maxWaitTime: { $max: '$actualWaitTime' },
          totalPatients: { $sum: 1 }
        }
      },
      { $sort: { avgWaitTime: -1 } }
    ]);

    res.json({
      success: true,
      data: departmentWaitTimes
    });

  } catch (error) {
    console.error('Department wait times error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department wait times'
    });
  }
});

// @route   GET /api/dashboard/queue-status
// @desc    Get real-time queue status
// @access  Private (Hospital Admin)
router.get('/queue-status', requireHospitalAdmin, async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queueStatus = await Queue.find({
      hospitalId,
      scheduledTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['waiting', 'in_progress'] }
    })
    .populate('patientId', 'fullName phone')
    .populate('doctorId', 'fullName employeeDetails.department')
    .sort({ scheduledTime: 1 })
    .limit(20);

    const formattedQueue = queueStatus.map(queue => ({
      tokenNumber: queue.tokenNumber,
      patientName: queue.patientId.fullName,
      department: queue.department,
      doctorName: queue.doctorId.fullName,
      status: queue.status,
      scheduledTime: queue.scheduledTime,
      estimatedWaitTime: queue.estimatedWaitTime,
      priority: queue.priority
    }));

    res.json({
      success: true,
      data: formattedQueue
    });

  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue status'
    });
  }
});

module.exports = router;