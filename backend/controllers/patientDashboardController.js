const Hospital = require('../models/Hospital');
const Queue = require('../models/Queue');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get all active hospitals
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select('name address contact departments description')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ success: false, message: 'Error fetching hospitals' });
  }
};

// Get hospital departments
exports.getHospitalDepartments = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).select('departments');
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    const activeDepts = hospital.departments.filter(d => d.isActive);
    res.json({
      success: true,
      data: activeDepts
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
};

// Get my active queue tokens
exports.getMyQueue = async (req, res) => {
  try {
    // 1. Find all Patient records associated with this user's email
    const patientRecords = await Patient.find({ email: req.user.email });
    const patientIds = patientRecords.map(p => p._id);

    // 2. Find active queue entries for these patient records
    const queueEntries = await Queue.find({
      patientId: { $in: patientIds },
      status: { $in: ['waiting', 'in_progress'] }
    })
    .populate('hospitalId', 'name address')
    .populate('doctorId', 'fullName employeeDetails.specialization')
    .sort({ createdAt: -1 });

    // Calculate real-time queue position
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const enrichedEntries = await Promise.all(queueEntries.map(async (entry) => {
      if (entry.status === 'in_progress') {
        return { ...entry.toObject(), position: 0 };
      }

    
      const position = await Queue.countDocuments({
        doctorId: entry.doctorId?._id || entry.doctorId,
        status: 'waiting',
        scheduledTime: { $gte: today, $lt: tomorrow },
        createdAt: { $lt: entry.createdAt }
      });

      return { 
        ...entry.toObject(), 
        position: position + 1,
        estimatedWaitTime: (position + 1) * 10
      };
    }));

    res.json({
      success: true,
      data: enrichedEntries
    });
  } catch (error) {
    console.error('Get my queue error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your queue' });
  }
};

// Get available doctors for a department
exports.getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      hospitalId: req.params.hospitalId,
      role: 'doctor',
      'employeeDetails.department': req.params.deptName,
      isActive: true
    }).select('fullName employeeDetails.specialization employeeDetails.experience');

    // Enrich with current queue count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const enrichedDoctors = await Promise.all(doctors.map(async (doc) => {
      const queueCount = await Queue.countDocuments({
        doctorId: doc._id,
        status: { $in: ['waiting', 'in_progress'] },
        scheduledTime: { $gte: today, $lt: tomorrow }
      });
      return {
        ...doc.toObject(),
        queueCount
      };
    }));

    res.json({
      success: true,
      data: enrichedDoctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
};

// Book a token
exports.bookToken = async (req, res) => {
  try {
    const { hospitalId, department, doctorId, notes } = req.body;

    if (!hospitalId || !department || !doctorId) {
      return res.status(400).json({ success: false, message: 'Hospital, department, and doctor are required' });
    }

    // 1. Find or create Patient record in this hospital for the user
    let patient = await Patient.findOne({ hospitalId, email: req.user.email });
    
    if (!patient) {
      // Generate a new patient ID
      const patientCount = await Patient.countDocuments({ hospitalId });
      const patientId = `P-${String(patientCount + 1).padStart(5, '0')}`;
      
      patient = new Patient({
        patientId,
        hospitalId,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.profile?.phone || 'N/A',
        dateOfBirth: req.user.profile?.dateOfBirth || new Date('1990-01-01'),
        gender: req.user.profile?.gender || 'other',
        address: {
          city: req.user.profile?.address?.city || 'N/A',
          state: req.user.profile?.address?.state || 'N/A',
          street: req.user.profile?.address?.street || 'N/A',
          zipCode: req.user.profile?.address?.zipCode || '00000'
        },
        emergencyContact: { name: 'N/A', relationship: 'N/A', phone: 'N/A' }
      });
      await patient.save();
    }

    // 2. Generate token number (similar logic to queueController)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayQueueCount = await Queue.countDocuments({
      hospitalId,
      scheduledTime: { $gte: today, $lt: tomorrow }
    });

    const tokenNumber = `T-${String(todayQueueCount + 1).padStart(3, '0')}`;

    // 3. Create queue entry
    const queueEntry = new Queue({
      tokenNumber,
      hospitalId,
      patientId: patient._id,
      doctorId,
      department,
      scheduledTime: new Date(),
      appointmentType: 'walk-in',
      priority: 'normal',
      notes,
      estimatedWaitTime: 30
    });

    await queueEntry.save();

    res.status(201).json({
      success: true,
      message: 'Token booked successfully',
      data: queueEntry
    });
  } catch (error) {
    console.error('Book token error:', error);
    res.status(500).json({ success: false, message: 'Error booking token' });
  }
};
