const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { estimateWaitTime } = require('../utils/waitTimeUtils');

// Get queue list with filters
exports.getQueueList = async (req, res) => {
  try {
    const { 
      status, 
      department, 
      date, 
      doctorId,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const hospitalId = req.hospitalId;

    // Build query
    let query = { hospitalId };

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    // Date filter
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.scheduledTime = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today or any active patient
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.$or = [
        { status: { $in: ['waiting', 'in_progress'] } },
        { scheduledTime: { $gte: today, $lt: tomorrow } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const queues = await Queue.find(query)
      .populate('patientId', 'fullName phone patientId')
      .populate('doctorId', 'fullName employeeDetails.department employeeDetails.specialization')
      .sort({ scheduledTime: 1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Queue.countDocuments(query);

    res.json({
      success: true,
      data: {
        queues,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue'
    });
  }
};

// Get single queue entry details
exports.getQueueEntry = async (req, res) => {
  try {
    const queue = await Queue.findOne({
      _id: req.params.queueId,
      hospitalId: req.hospitalId
    })
    .populate('patientId')
    .populate('doctorId', 'fullName employeeDetails');

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    res.json({
      success: true,
      data: queue
    });

  } catch (error) {
    console.error('Get queue entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue entry'
    });
  }
};

// Create a new queue entry
exports.createQueueEntry = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      department,
      scheduledTime,
      appointmentType = 'walk-in',
      priority = 'normal',
      notes
    } = req.body;

    // Validation
    if (!patientId || !doctorId || !department || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Patient, doctor, department, and scheduled time are required'
      });
    }

    // Verify patient belongs to hospital
    const patient = await Patient.findOne({
      _id: patientId,
      hospitalId: req.hospitalId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found in this hospital'
      });
    }

    // Verify doctor belongs to hospital
    const doctor = await User.findOne({
      _id: doctorId,
      hospitalId: req.hospitalId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in this hospital'
      });
    }

    // Generate token number
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayQueueCount = await Queue.countDocuments({
      hospitalId: req.hospitalId,
      scheduledTime: { $gte: today, $lt: tomorrow }
    });

    const tokenNumber = `T-${String(todayQueueCount + 1).padStart(3, '0')}`;

    // Create queue entry
    const queueData = {
      tokenNumber,
      hospitalId: req.hospitalId,
      patientId,
      doctorId,
      department,
      scheduledTime: new Date(scheduledTime),
      appointmentType,
      priority,
      notes,
      estimatedWaitTime: await estimateWaitTime(doctorId, req.hospitalId)
    };

    const queue = new Queue(queueData);
    await queue.save();

    // Populate and return
    const populatedQueue = await Queue.findById(queue._id)
      .populate('patientId', 'fullName phone patientId')
      .populate('doctorId', 'fullName employeeDetails.department');

    res.status(201).json({
      success: true,
      message: 'Queue entry created successfully',
      data: populatedQueue
    });

  } catch (error) {
    console.error('Create queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating queue entry'
    });
  }
};

// Update queue status
exports.updateQueueStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['waiting', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const updateData = { status };
    
    // Set timestamps based on status
    if (status === 'in_progress') {
      updateData.calledTime = new Date();
    } else if (status === 'completed') {
      updateData.completedTime = new Date();
      
      // Calculate consultation duration if we have calledTime
      const currentQueue = await Queue.findById(req.params.queueId);
      if (currentQueue && currentQueue.calledTime) {
        updateData.consultationTime = Math.round((updateData.completedTime - currentQueue.calledTime) / (1000 * 60));
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    const queue = await Queue.findOneAndUpdate(
      {
        _id: req.params.queueId,
        hospitalId: req.hospitalId
      },
      updateData,
      { new: true }
    )
    .populate('patientId', 'fullName phone patientId')
    .populate('doctorId', 'fullName employeeDetails.department');

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Queue status updated successfully',
      data: queue
    });

  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating queue status'
    });
  }
};

// Update queue entry
exports.updateQueueEntry = async (req, res) => {
  try {
    const {
      scheduledTime,
      priority,
      estimatedWaitTime,
      notes
    } = req.body;

    const updateData = {};
    
    if (scheduledTime) updateData.scheduledTime = new Date(scheduledTime);
    if (priority) updateData.priority = priority;
    if (estimatedWaitTime !== undefined) updateData.estimatedWaitTime = estimatedWaitTime;
    if (notes !== undefined) updateData.notes = notes;

    const queue = await Queue.findOneAndUpdate(
      {
        _id: req.params.queueId,
        hospitalId: req.hospitalId
      },
      updateData,
      { new: true }
    )
    .populate('patientId', 'fullName phone patientId')
    .populate('doctorId', 'fullName employeeDetails.department');

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Queue entry updated successfully',
      data: queue
    });

  } catch (error) {
    console.error('Update queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating queue entry'
    });
  }
};

// Cancel queue entry
exports.deleteQueueEntry = async (req, res) => {
  try {
    const queue = await Queue.findOneAndUpdate(
      {
        _id: req.params.queueId,
        hospitalId: req.hospitalId
      },
      { 
        status: 'cancelled',
        notes: 'Cancelled by admin'
      },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Queue entry cancelled successfully',
      data: queue
    });

  } catch (error) {
    console.error('Cancel queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling queue entry'
    });
  }
};

// Get estimated wait time for a doctor
exports.getDoctorWaitTime = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const hospitalId = req.hospitalId;

    const waitTime = await estimateWaitTime(doctorId, hospitalId);

    res.json({
      success: true,
      data: { estimatedWaitTime: waitTime }
    });
  } catch (error) {
    console.error('Get doctor wait time error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating wait time'
    });
  }
};
