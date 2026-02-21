const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const User = require('../models/User');

// Get summary report for date range
exports.getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hospitalId = req.hospitalId;

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    // Get summary statistics
    const summary = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShow: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          avgWaitTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$actualWaitTime', null] }, { $gt: ['$actualWaitTime', 0] }] },
                '$actualWaitTime',
                null
              ]
            }
          }
        }
      }
    ]);

    // Get department-wise statistics
    const departmentStats = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$department',
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgWaitTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$actualWaitTime', null] }, { $gt: ['$actualWaitTime', 0] }] },
                '$actualWaitTime',
                null
              ]
            }
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    // Get daily statistics for the period
    const dailyStats = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledTime' },
            month: { $month: '$scheduledTime' },
            day: { $dayOfMonth: '$scheduledTime' }
          },
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        summary: summary[0] || {
          totalAppointments: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          avgWaitTime: 0
        },
        departmentStats,
        dailyStats
      }
    });

  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating summary report'
    });
  }
};

// Get detailed report with all appointments
exports.getDetailedReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      department, 
      status, 
      doctorId,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const hospitalId = req.hospitalId;

    // Build query
    let query = { hospitalId };

    // Date range
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.scheduledTime.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.scheduledTime.$lte = end;
      }
    }

    if (department) query.department = department;
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Queue.find(query)
      .populate('patientId', 'fullName phone patientId dateOfBirth gender')
      .populate('doctorId', 'fullName employeeDetails.department employeeDetails.specialization')
      .sort({ scheduledTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Queue.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Detailed report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating detailed report'
    });
  }
};

// Get doctor performance report
exports.getDoctorPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hospitalId = req.hospitalId;

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    const doctorPerformance = await Queue.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
          scheduledTime: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctorId',
          doctorName: { $first: '$doctor.fullName' },
          department: { $first: '$doctor.employeeDetails.department' },
          specialization: { $first: '$doctor.employeeDetails.specialization' },
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShow: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          avgWaitTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$actualWaitTime', null] }, { $gt: ['$actualWaitTime', 0] }] },
                '$actualWaitTime',
                null
              ]
            }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ['$completed', '$totalAppointments'] },
              100
            ]
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        doctorPerformance
      }
    });

  } catch (error) {
    console.error('Doctor performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating doctor performance report'
    });
  }
};

// Export report data as CSV
exports.exportReport = async (req, res) => {
  try {
    const { startDate, endDate, type = 'detailed' } = req.query;
    const hospitalId = req.hospitalId;

    // Build query
    let query = { hospitalId };
    
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.scheduledTime.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.scheduledTime.$lte = end;
      }
    }

    const appointments = await Queue.find(query)
      .populate('patientId', 'fullName phone patientId dateOfBirth gender')
      .populate('doctorId', 'fullName employeeDetails.department employeeDetails.specialization')
      .sort({ scheduledTime: -1 })
      .limit(1000); // Limit for performance

    // Generate CSV content
    const csvHeaders = [
      'Token Number',
      'Patient Name',
      'Patient ID',
      'Phone',
      'Department',
      'Doctor Name',
      'Scheduled Time',
      'Status',
      'Wait Time (min)',
      'Priority',
      'Appointment Type'
    ];

    const csvRows = appointments.map(appointment => [
      appointment.tokenNumber,
      appointment.patientId?.fullName || 'N/A',
      appointment.patientId?.patientId || 'N/A',
      appointment.patientId?.phone || 'N/A',
      appointment.department,
      appointment.doctorId?.fullName || 'N/A',
      appointment.scheduledTime.toISOString().split('T')[0],
      appointment.status,
      appointment.actualWaitTime || 'N/A',
      appointment.priority,
      appointment.appointmentType
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="hospital-report-${Date.now()}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting CSV'
    });
  }
};
