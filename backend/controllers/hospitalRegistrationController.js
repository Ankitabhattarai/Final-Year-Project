const Hospital = require('../models/Hospital');

// @desc    Submit a hospital registration application
// @route   POST /api/hospitals/apply
// @access  Public
exports.applyHospital = async (req, res) => {
    try {
        const { 
            name, 
            address, 
            contact, 
            adminEmail,
            registrationNumber 
        } = req.body;

        // Basic validation
        if (!name || !address || !contact || !adminEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }

        // Check if hospital with same name or email already exists
        const existingHospital = await Hospital.findOne({ 
            $or: [
                { name },
                { 'contact.email': contact.email },
                { adminEmail }
            ]
        });

        if (existingHospital) {
            return res.status(400).json({ 
                success: false, 
                message: 'A hospital application with this name or email already exists' 
            });
        }

        const hospital = await Hospital.create({
            name,
            address,
            contact,
            adminEmail,
            registrationNumber,
            status: 'pending',
            isActive: false
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully. We will review it soon.',
            data: hospital
        });
    } catch (error) {
        console.error('Hospital application error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
