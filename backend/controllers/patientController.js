const Patient = require('../models/Patient');

// Get all patients for hospital
exports.getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const hospitalId = req.hospitalId;

    let query = { hospitalId, isActive: true };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients'
    });
  }
};

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    // Validation
    if (!fullName || !phone || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, date of birth, and gender are required'
      });
    }

    // Generate patient ID
    const hospitalId = req.hospitalId;
    const patientCount = await Patient.countDocuments({ hospitalId });
    const patientId = `P-${String(patientCount + 1).padStart(5, '0')}`;

    const newPatient = new Patient({
      patientId,
      hospitalId,
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    });

    await newPatient.save();

    res.status(201).json({
      success: true,
      data: newPatient
    });

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient'
    });
  }
};
