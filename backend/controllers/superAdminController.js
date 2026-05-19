const Hospital = require('../models/Hospital');
const User = require('../models/User');
const { sendHospitalStatusEmail } = require('../utils/emailUtils');
const crypto = require('crypto');

// @desc    Get all hospital registration requests
// @route   GET /api/admin/hospitals/pending
// @access  Private/Admin
exports.getPendingHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ status: 'pending' });
        res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        console.error('Get pending hospitals error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve or reject a hospital registration
// @route   PUT /api/admin/hospitals/:id/status
// @access  Private/Admin
exports.processHospitalRequest = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        hospital.status = status;
        let tempPassword = null;

        if (status === 'approved') {
            hospital.isActive = true;
            
            // Check if admin user already exists
            let adminUser = await User.findOne({ email: hospital.adminEmail });
            
            if (!adminUser) {
                // Generate a random 10-character password
                tempPassword = crypto.randomBytes(5).toString('hex');
                
                adminUser = new User({
                    fullName: `${hospital.name} Admin`,
                    email: hospital.adminEmail,
                    password: tempPassword,
                    role: 'hospital_admin',
                    hospitalId: hospital._id,
                    mustChangePassword: true
                });
                await adminUser.save();
            } else {
                // Link the existing user to the hospital and set their role to admin
                adminUser.role = 'hospital_admin';
                adminUser.hospitalId = hospital._id;
                await adminUser.save();
            }
        } else {
            hospital.isActive = false;
        }

        await hospital.save();

        // Send email notification to hospital adminEmail with credentials if approved
        await sendHospitalStatusEmail(hospital.adminEmail, hospital.name, status, tempPassword);

        res.json({ 
            success: true, 
            message: `Hospital ${status} successfully`,
            data: hospital 
        });
    } catch (error) {
        console.error('Process hospital request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all hospitals in the system
// @route   GET /api/admin/hospitals
// @access  Private/Admin
exports.getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        console.error('Get all hospitals error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all patients in the system
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        console.error('Get all patients error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
    try {
        const [totalHospitals, totalPatients, pendingHospitals, totalDoctors] = await Promise.all([
            Hospital.countDocuments({ status: 'approved' }),
            User.countDocuments({ role: 'patient' }),
            Hospital.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'doctor' })
        ]);

        res.json({
            success: true,
            data: {
                totalHospitals,
                totalPatients,
                pendingHospitals,
                totalDoctors
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
